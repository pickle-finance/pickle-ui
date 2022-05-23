import { FC, Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { NULL_ADDRESS } from "picklefinance-core/lib/model/PickleModel";
import { Trans, useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";
import { Chains } from "picklefinance-core";

import { roundToSignificantDigits, shortenAddress } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";
import Button from "v2/components/Button";
import Link from "v2/components/Link";
import { AssetWithData } from "v2/store/core";
import DetailsToggle from "./DetailsToggle";
import FarmDocs from "./FarmDocs";
import { isJar, isStandaloneFarm, jarSupportsStaking } from "v2/store/core.helpers";
import { metamaskAdd } from "./flows/utils";

interface Props {
  asset: AssetWithData;
  hideDescription?: boolean;
}

interface InfoProps {
  label: string;
  tooltipText: string | null;
  value: string;
}

const InfoRowContent: FC<InfoProps> = ({ label, tooltipText, value }) => (
  <p className="flex py-2 text-foreground-alt-200 justify-between">
    <span className="font-body font-bold">
      {label}
      {tooltipText && (
        <MoreInfo>
          <span className="text-foreground-alt-200 text-sm">{tooltipText}</span>
        </MoreInfo>
      )}
    </span>
    <span className="font-medium text-primary text-base">{value}</span>
  </p>
);

interface ComponentRowProps {
  property: string;
  value: string;
}

const ComponentRow: FC<ComponentRowProps> = ({ property, value }) => (
  <p className="flex justify-between">
    <span className="ml-4 font-body font-medium text-sm">{property}</span>
    <span className="text-primary font-medium text-sm">{value}</span>
  </p>
);

const FarmsTableRowDetails: FC<Props> = ({ asset, hideDescription }) => {
  const { t } = useTranslation("common");
  const chain = Chains.get(asset.chain);
  const { library } = useWeb3React<Web3Provider>();

  const totalTokensInJarAndFarm =
    parseFloat(asset.depositTokensInJar.tokens) + parseFloat(asset.depositTokensInFarm.tokens);

  const userShare =
    (isJar(asset) || isStandaloneFarm(asset)) && asset.details.tokenBalance
      ? totalTokensInJarAndFarm / asset.details.tokenBalance
      : 0;

  const userShareHarvestUsd =
    userShare *
    (asset.details.harvestStats?.harvestableUSD || 0) *
    (1 - (chain?.defaultPerformanceFee || 0.2));

  return (
    <Disclosure as={Fragment}>
      {({ open }) => (
        <>
          <Transition
            as={Fragment}
            enter="transition duration-100 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition duration-100 ease-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Disclosure.Panel as="div" className="grid grid-cols-4 py-4 gap-2">
              <div className="pr-4 col-span-3 border-r border-foreground-alt-500">
                <div className="flex justify-between">
                  <span className="font-title text-foreground-alt-200 inline-flex items-center font-medium text-base leading-5">
                    <Trans i18nKey="v2.farms.tokensDeposited">
                      You have
                      <span className="text-primary mx-2">
                        {{ amount: roundToSignificantDigits(totalTokensInJarAndFarm, 7) }}
                      </span>
                      pTokens
                    </Trans>
                    <MoreInfo>
                      <span className="text-foreground-alt-200 text-sm">
                        {t("v2.farms.pToken")}
                      </span>
                    </MoreInfo>
                  </span>
                  <Button onClick={() => metamaskAdd(asset, library)} type="secondary">
                    {t("v2.farms.metamaskAdd")}
                  </Button>
                </div>
                <div className="pt-2 mb-4">
                  <FarmDocs asset={asset} hideDescription={hideDescription} />
                </div>
                <div className="grid grid-cols-3 py-1">
                  <div>
                    <span className="font-body font-bold text-foreground-alt-200">
                      {t("v2.farms.jarAddress")}
                    </span>
                  </div>
                  <div>
                    <span className="ml-auto">
                      <Link href={`${chain?.explorer}/address/${asset.contract}`} external primary>
                        {shortenAddress(asset.contract)}
                      </Link>
                    </span>
                  </div>
                </div>
                {isJar(asset) &&
                  asset.details?.strategyAddr != NULL_ADDRESS &&
                  asset.details?.strategyAddr !== undefined && (
                    <div className="grid grid-cols-3 py-1">
                      <div>
                        <span className="font-body font-bold text-foreground-alt-200">
                          {t("v2.farms.strategyAddress")}
                        </span>
                      </div>
                      <div>
                        <span className="ml-auto">
                          <Link
                            href={`${chain?.explorer}/address/${asset.details?.strategyAddr}`}
                            external
                            primary
                          >
                            {shortenAddress(asset.details?.strategyAddr)}
                          </Link>
                        </span>
                      </div>
                    </div>
                  )}
                {jarSupportsStaking(asset) && (
                  <div className="grid grid-cols-3 py-1">
                    <div>
                      <span className="font-body font-bold text-foreground-alt-200">
                        {t("v2.farms.farmAddress")}
                      </span>
                    </div>
                    <div>
                      <span className="ml-auto">
                        <Link
                          href={`${chain?.explorer}/address/${asset.farm?.farmAddress}`}
                          external
                          primary
                        >
                          {shortenAddress(asset.farm?.farmAddress!)}
                        </Link>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 border-r border-foreground-alt-500">
                {isJar(asset) && (
                  <InfoRowContent
                    label={t("v2.farms.ratio")}
                    tooltipText={t("v2.farms.ratioTooltip")}
                    value={asset.details.ratio?.toFixed(4) || ""}
                  />
                )}
                <InfoRowContent
                  label={t("v2.farms.pending")}
                  tooltipText={t("v2.farms.pendingTooltip")}
                  value={`$${userShareHarvestUsd.toFixed(4)}`}
                />
                <InfoRowContent
                  label={t("v2.farms.baseApr")}
                  tooltipText={t("v2.farms.baseAprTooltip")}
                  value={`${asset.aprStats?.apr.toFixed(3)}%`}
                />
                <InfoRowContent label={t("v2.farms.yieldRates")} tooltipText={null} value="" />
                <ComponentRow
                  property={t("v2.time.weekly")}
                  value={`${((asset.aprStats?.apr || 0) / 52).toFixed(2)}%`}
                />
                <ComponentRow
                  property={t("v2.time.monthly")}
                  value={`${((asset.aprStats?.apr || 0) / 12).toFixed(2)}%`}
                />
              </div>
            </Disclosure.Panel>
          </Transition>
          <Disclosure.Button as="div">
            <DetailsToggle open={open} />
          </Disclosure.Button>
        </>
      )}
    </Disclosure>
  );
};

export default FarmsTableRowDetails;

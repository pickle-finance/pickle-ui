import { FC, Fragment } from "react";
import { Disclosure, Transition } from "@headlessui/react";
import { NULL_ADDRESS } from "picklefinance-core/lib/model/PickleModel";
import { Trans, useTranslation } from "next-i18next";
import { useSelector } from "react-redux";

import { shortenAddress } from "v2/utils";
import MoreInfo from "v2/components/MoreInfo";
import Button from "v2/components/Button";
import Link from "v2/components/Link";
import { CoreSelectors, JarWithData } from "v2/store/core";
import DetailsToggle from "./DetailsToggle";

interface Props {
  jar: JarWithData;
}

interface InfoProps {
  label: string;
  tooltipText: string | null;
  value: string;
}

const InfoRowContent: FC<InfoProps> = ({ label, tooltipText, value }) => (
  <p className="flex py-2 text-foreground-alt-200 justify-between">
    <span className="font-body font-bold">
      {label} {tooltipText && <MoreInfo secondaryText={tooltipText} />}
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

const FarmsTableRowDetails: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const allCore = useSelector(CoreSelectors.selectCore);
  const chain = allCore?.chains.find((x) => x.network === jar.chain);

  const totalTokensInJarAndFarm =
    parseFloat(jar.depositTokensInJar.tokens) + parseFloat(jar.depositTokensInFarm.tokens);

  const userShare = jar.details.tokenBalance
    ? totalTokensInJarAndFarm / jar.details.tokenBalance
    : 0;

  const userShareHarvestUsd =
    userShare *
    (jar.details.harvestStats?.harvestableUSD || 0) *
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
              <div className="col-span-2 border-r border-foreground-alt-500">
                <div className="flex">
                  <span className="font-title text-foreground-alt-200 inline-flex items-center font-medium text-base leading-5">
                    <Trans i18nKey="v2.farms.tokensDeposited">
                      You have
                      <span className="text-primary mx-2">
                        {{ amount: totalTokensInJarAndFarm.toFixed(3) }}
                      </span>
                      pTokens
                    </Trans>
                    <MoreInfo secondaryText={t("v2.farms.pToken")} />
                  </span>
                  <Button type="secondary" className="ml-auto mr-5">
                    {t("v2.farms.metamaskAdd")}
                  </Button>
                </div>
                <p className="py-4 text-sm text-foreground">
                  Description of what the jar does here... need docs for this info...
                  <br />
                  blah blah...
                  <br />
                  blah blah...
                </p>
                <div className="grid grid-cols-3 py-1">
                  <div>
                    <span className="font-body font-bold text-foreground-alt-200">
                      {t("v2.farms.jarAddress")}
                    </span>
                  </div>
                  <div>
                    <span className="ml-auto">
                      <Link href={`${chain?.explorer}/address/${jar.contract}`} external primary>
                        {shortenAddress(jar.contract)}
                      </Link>
                    </span>
                  </div>
                </div>
                {jar.farm?.farmAddress != NULL_ADDRESS && (
                  <div className="grid grid-cols-3 py-1">
                    <div>
                      <span className="font-body font-bold text-foreground-alt-200">
                        {t("v2.farms.farmAddress")}
                      </span>
                    </div>
                    <div>
                      <span className="ml-auto">
                        <Link
                          href={`${chain?.explorer}/address/${jar.farm?.farmAddress}`}
                          external
                          primary
                        >
                          {shortenAddress(jar.farm?.farmAddress!)}
                        </Link>
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-4 border-r border-foreground-alt-500">
                <InfoRowContent
                  label={t("v2.farms.ratio")}
                  tooltipText={t("v2.farms.ratioTooltip")}
                  value={jar.details.ratio?.toFixed(4) || ""}
                />
                <InfoRowContent
                  label={t("v2.farms.pending")}
                  tooltipText={t("v2.farms.pendingTooltip")}
                  value={`$${userShareHarvestUsd.toFixed(4)}`}
                />
                <InfoRowContent
                  label={t("v2.farms.compounding")}
                  tooltipText={t("v2.farms.compoundingTooltip")}
                  value={`TODO`}
                />
                <InfoRowContent
                  label={t("v2.farms.baseApr")}
                  tooltipText={t("v2.farms.baseAprTooltip")}
                  value={`${jar.aprStats?.apr.toFixed(3)}%`}
                />
              </div>
              <div className="px-4">
                <InfoRowContent label={t("v2.farms.apyBreakdown")} tooltipText={null} value="" />
                {jar.aprStats?.components.map((x, idx) => (
                  <>
                    <ComponentRow property={x.name.toUpperCase()} value={`${x.apr}%`} />
                    {idx === jar.aprStats?.components?.length! - 1 &&
                      jar.aprStats?.apy != jar.aprStats?.apr && (
                        <ComponentRow
                          property={t("v2.farms.compounding")}
                          value={`${(jar.aprStats?.apy! - jar.aprStats?.apr!).toFixed(3)}%`}
                        />
                      )}
                  </>
                ))}
                <div className="mt-3">
                  <InfoRowContent label={t("v2.farms.yieldRates")} tooltipText={null} value="" />
                  <ComponentRow
                    property={t("v2.time.weekly")}
                    value={`${((jar.aprStats?.apr || 0) / 52).toFixed(2)}%`}
                  />
                  <ComponentRow
                    property={t("v2.time.monthly")}
                    value={`${((jar.aprStats?.apr || 0) / 12).toFixed(2)}%`}
                  />
                </div>
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

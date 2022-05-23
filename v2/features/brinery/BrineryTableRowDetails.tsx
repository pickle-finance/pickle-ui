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
import { BrineryWithData } from "v2/store/core";
import DetailsToggle from "../farms/DetailsToggle";
import FarmDocs from "../farms/FarmDocs";
import { metamaskAdd } from "../farms/flows/utils";

interface Props {
  brinery: BrineryWithData;
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

const BrineryTableRowDetails: FC<Props> = ({ brinery, hideDescription }) => {
  const { t } = useTranslation("common");
  const chain = Chains.get(brinery.chain);
  const { library } = useWeb3React<Web3Provider>();

  const totalTokensInBrinery = parseFloat(brinery.brineryBalance.tokens);

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
                        {{ amount: roundToSignificantDigits(totalTokensInBrinery, 7) }}
                      </span>
                      pTokens
                    </Trans>
                    <MoreInfo>
                      <span className="text-foreground-alt-200 text-sm">
                        {t("v2.farms.pToken")}
                      </span>
                    </MoreInfo>
                  </span>
                  <Button onClick={() => metamaskAdd(brinery, library)} type="secondary">
                    {t("v2.farms.metamaskAdd")}
                  </Button>
                </div>
                <div className="pt-2 mb-4">
                  <FarmDocs asset={brinery} hideDescription={hideDescription} />
                </div>
                <div className="grid grid-cols-3 py-1">
                  <div>
                    <span className="font-body font-bold text-foreground-alt-200">
                      {t("v2.brinery.brineryAddress")}
                    </span>
                  </div>
                  <div>
                    <span className="ml-auto">
                      <Link
                        href={`${chain?.explorer}/address/${brinery.contract}`}
                        external
                        primary
                      >
                        {shortenAddress(brinery.contract)}
                      </Link>
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 py-1">
                  <div>
                    <span className="font-body font-bold text-foreground-alt-200">
                      {t("v2.brinery.lockerAddress")}
                    </span>
                  </div>
                  <div>
                    <span className="ml-auto">
                      <Link
                        href={`${chain?.explorer}/address/${brinery.details.lockerAddr}`}
                        external
                        primary
                      >
                        {shortenAddress(brinery.details.lockerAddr)}
                      </Link>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 py-1">
                  <div>
                    <span className="font-body font-bold text-foreground-alt-200">
                      {t("v2.brinery.strategyAddress")}
                    </span>
                  </div>
                  <div>
                    <span className="ml-auto">
                      <Link
                        href={`${chain?.explorer}/address/${brinery.details?.strategyAddr}`}
                        external
                        primary
                      >
                        {shortenAddress(brinery.details?.strategyAddr!)}
                      </Link>
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 border-r border-foreground-alt-500">
                <InfoRowContent
                  label={t("v2.farms.baseApr")}
                  tooltipText={t("v2.farms.baseAprTooltip")}
                  value={`${brinery.aprStats?.apr.toFixed(3)}%`}
                />
                <InfoRowContent label={t("v2.farms.yieldRates")} tooltipText={null} value="" />
                <ComponentRow
                  property={t("v2.time.weekly")}
                  value={`${((brinery.aprStats?.apr || 0) / 52).toFixed(2)}%`}
                />
                <ComponentRow
                  property={t("v2.time.monthly")}
                  value={`${((brinery.aprStats?.apr || 0) / 12).toFixed(2)}%`}
                />
              </div>
            </Disclosure.Panel>
          </Transition>
          <Disclosure.Button as="div">
            <DetailsToggle open={open} isBrinery={true} />
          </Disclosure.Button>
        </>
      )}
    </Disclosure>
  );
};

export default BrineryTableRowDetails;

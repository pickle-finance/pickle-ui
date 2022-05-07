import { FC } from "react";
import { useTranslation } from "next-i18next";
import { AssetEnablement, AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";
import { InformationCircleIcon } from "@heroicons/react/solid";

import { useAppSelector } from "v2/store";
import Link from "v2/components/Link";
import { BrineryWithData, CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices } from "v2/utils/user";
import FarmsTableRowDetails from "./FarmsTableRowDetails";
import FarmsTableRowBodyTransactionControls from "./FarmTableRowBodyTransactionControls";
import ConnectButton from "./ConnectButton";
import { useAccount, useNeedsNetworkSwitch } from "v2/hooks";
import FarmsTableRowBodyV3TransactionControls from "./FarmTableRowBodyTransactionControlsUniV3";
import BrineryTableRowBodyTransactionControls from "../brinery/BrineryTableRowBodyTransactionControls";
import BrineryTableRowDetails from "../brinery/BrineryTableRowDetails";

interface Props {
  jarOrBrinery: JarWithData | BrineryWithData;
  hideDescription?: boolean;
}

const FarmsTableRowBody: FC<Props> = ({ jarOrBrinery, hideDescription }) => {
  const { t } = useTranslation("common");
  const { network, needsNetworkSwitch } = useNeedsNetworkSwitch(jarOrBrinery.chain);

  const tokensInWallet = jarOrBrinery.depositTokensInWallet.tokensVisible;
  const depositTokenCountString = t("v2.farms.tokens", { amount: tokensInWallet });

  const analyticsUrl: string | undefined = jarOrBrinery.details?.apiKey
    ? "/v2/stats/jar?jar=" + jarOrBrinery.details.apiKey
    : undefined;

  const isBrinery = !(jarOrBrinery as JarWithData).farm;
  const isUniV3 = jarOrBrinery.protocol === AssetProtocol.UNISWAP_V3;
  let token0Name, token1Name, userBalanceToken0, userBalanceToken1;
  if (isUniV3) {
    token0Name = jarOrBrinery.depositToken.components?.[0];
    token1Name = jarOrBrinery.depositToken.components?.[1];
    userBalanceToken0 = (jarOrBrinery as JarWithData).walletComponentTokens[token0Name || ""]
      ?.tokensVisible;
    userBalanceToken1 = (jarOrBrinery as JarWithData).walletComponentTokens[token1Name || ""]
      ?.tokensVisible;
  }

  const renderAssetDetails = () => {
    if (isBrinery)
      return (
        <BrineryTableRowDetails
          brinery={jarOrBrinery as BrineryWithData}
          hideDescription={hideDescription}
        />
      );
    return (
      <FarmsTableRowDetails jar={jarOrBrinery as JarWithData} hideDescription={hideDescription} />
    );
  };

  const renderTransactionControls = () => {
    if (isUniV3)
      return <FarmsTableRowBodyV3TransactionControls jar={jarOrBrinery as JarWithData} />;
    if (isBrinery)
      return <BrineryTableRowBodyTransactionControls brinery={jarOrBrinery as BrineryWithData} />;
    // Default is farms control
    return <FarmsTableRowBodyTransactionControls jar={jarOrBrinery as JarWithData} />;
  };

  return (
    <td
      colSpan={6}
      className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
    >
      {jarOrBrinery.enablement === AssetEnablement.WITHDRAW_ONLY && (
        <div className="flex justify-center text-foreground-alt-200 text-sm mt-1 mb-6">
          <InformationCircleIcon className="w-5 h-5 text-accent mr-2" />
          {t("v2.farms.withdrawOnly")}
        </div>
      )}
      <div className="flex">
        <div className="pt-4 pb-6 flex-shrink-0 mr-6">
          {(isUniV3 && (
            <>
              <p className="font-title font-medium text-base leading-5">
                {`${userBalanceToken0 || "0"} ${token0Name?.toUpperCase()}`}
              </p>
              <p className="my-2 font-title font-medium text-base leading-5">
                {`${userBalanceToken1 || "0"} ${token1Name?.toUpperCase()}`}
              </p>
            </>
          )) || (
            <p className="font-title font-medium text-base leading-5">{depositTokenCountString}</p>
          )}
          <p className="font-normal text-xs text-foreground-alt-200 mb-6">
            {t("v2.balances.balance")}
          </p>
          <Link href={jarOrBrinery.depositToken.link} className="font-bold" external primary>
            {t("v2.farms.getToken", { token: jarOrBrinery.depositToken.name })}
          </Link>
          <br />
          {analyticsUrl && (
            <Link href={analyticsUrl as string} className="font-bold" external primary>
              {t("v2.farms.statsAndDocs")}
            </Link>
          )}
        </div>
        <div className="relative w-full mb-2">
          {renderTransactionControls()}

          {needsNetworkSwitch && (
            <div className="absolute inset-0 flex grow justify-center items-center border border-foreground-alt-500 rounded-xl bg-background-light bg-opacity-90 backdrop-filter backdrop-blur-sm">
              <ConnectButton network={network} />
            </div>
          )}
        </div>
      </div>
      {renderAssetDetails()}
    </td>
  );
};

export default FarmsTableRowBody;

import { FC } from "react";
import { useTranslation } from "next-i18next";
import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";

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

  return (
    <td
      colSpan={6}
      className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
    >
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
          {isUniV3 ? (
            <FarmsTableRowBodyV3TransactionControls jar={jarOrBrinery as JarWithData} />
          ) : (
            <FarmsTableRowBodyTransactionControls jar={jarOrBrinery as JarWithData} />
          )}
          {needsNetworkSwitch && (
            <div className="absolute inset-0 flex grow justify-center items-center border border-foreground-alt-500 rounded-xl bg-background-light bg-opacity-90 backdrop-filter backdrop-blur-sm">
              <ConnectButton network={network} />
            </div>
          )}
        </div>
      </div>
      {/* <FarmsTableRowDetails jar={jar} hideDescription={hideDescription} /> */}
    </td>
  );
};

export default FarmsTableRowBody;

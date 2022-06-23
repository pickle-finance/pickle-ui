import { FC } from "react";
import { useTranslation } from "next-i18next";
import { AssetProtocol } from "picklefinance-core/lib/model/PickleModelJson";

import Link from "v2/components/Link";
import { AssetWithData, BrineryWithData } from "v2/store/core";
import FarmsTableRowDetails from "./FarmsTableRowDetails";
import FarmsTableRowBodyTransactionControls from "./FarmTableRowBodyTransactionControls";
import ConnectButton from "./ConnectButton";
import { useNeedsNetworkSwitch } from "v2/hooks";
import FarmsTableRowBodyV3TransactionControls from "./FarmTableRowBodyTransactionControlsUniV3";
import BrineryTableRowBodyTransactionControls from "../brinery/BrineryTableRowBodyTransactionControls";
import BrineryTableRowDetails from "../brinery/BrineryTableRowDetails";
import { isBrinery, isJar } from "v2/store/core.helpers";
import FarmAdditionalInfo from "./FarmAdditionalInfo";

interface Props {
  asset: AssetWithData | BrineryWithData;
  hideDescription?: boolean;
}

const FarmsTableRowBody: FC<Props> = ({ asset, hideDescription }) => {
  const { t } = useTranslation("common");
  const { network, needsNetworkSwitch } = useNeedsNetworkSwitch(asset.chain);

  const tokensInWallet = asset.depositTokensInWallet.tokensVisible;
  const tokensInWalletUSD = asset.depositTokensInWallet.tokensUSD;
  const depositTokenCountString = t("v2.farms.tokens", { amount: tokensInWallet });

  const analyticsUrl: string | undefined = asset.details?.apiKey
    ? "/stats?jar=" + asset.details.apiKey
    : undefined;

  const isUniV3 = asset.protocol === AssetProtocol.UNISWAP_V3;
  let token0Name, token1Name, userBalanceToken0, userBalanceToken1;
  if (isUniV3 && isJar(asset)) {
    token0Name = asset.depositToken.components?.[0];
    token1Name = asset.depositToken.components?.[1];
    userBalanceToken0 = asset.walletComponentTokens[token0Name || ""]?.tokensVisible;
    userBalanceToken1 = asset.walletComponentTokens[token1Name || ""]?.tokensVisible;
  }

  const renderAssetDetails = () => {
    if (isBrinery(asset))
      return <BrineryTableRowDetails brinery={asset} hideDescription={hideDescription} />;
    return <FarmsTableRowDetails asset={asset} hideDescription={hideDescription} />;
  };

  const renderTransactionControls = () => {
    if (isUniV3 && isJar(asset)) return <FarmsTableRowBodyV3TransactionControls jar={asset} />;
    if (isBrinery(asset)) return <BrineryTableRowBodyTransactionControls brinery={asset} />;
    // Default is farms control
    return <FarmsTableRowBodyTransactionControls asset={asset} />;
  };

  return (
    <td
      colSpan={6}
      className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
    >
      <FarmAdditionalInfo asset={asset} />
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
            <p className="font-title font-medium text-base leading-5">{depositTokenCountString} <br/>{tokensInWalletUSD} USD</p>
          )}
          <p className="font-normal text-xs text-foreground-alt-200 mb-6">
            {t("v2.balances.balance")}
          </p>
          <Link href={asset.depositToken.link} className="font-bold" external primary>
            {t("v2.farms.getToken", { token: asset.depositToken.name })}
          </Link>
          <br />
          {analyticsUrl && (
            <Link href={analyticsUrl as string} className="font-bold" primary>
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

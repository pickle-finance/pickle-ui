import { FC } from "react";
import { useTranslation } from "next-i18next";

import { useAppSelector } from "v2/store";
import Link from "v2/components/Link";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices } from "v2/utils/user";
import FarmsTableRowDetails from "./FarmsTableRowDetails";
import FarmsTableRowBodyTransactionControls from "./FarmTableRowBodyTransactionControls";
import ConnectButton from "./ConnectButton";
import { useNeedsNetworkSwitch } from "v2/hooks";

interface Props {
  jar: JarWithData;
  hideDescription?: boolean;
}

const FarmsTableRowBody: FC<Props> = ({ jar, hideDescription }) => {
  const { t } = useTranslation("common");
  const pfcore = useAppSelector(CoreSelectors.selectCore);
  const userModel = useAppSelector(UserSelectors.selectData);
  const { network, needsNetworkSwitch } = useNeedsNetworkSwitch(jar.chain);

  const data = getUserAssetDataWithPrices(jar, pfcore, userModel);
  const tokensInWallet = data.depositTokensInWallet.tokens;
  const depositTokenCountString = t("v2.farms.tokens", { amount: tokensInWallet });

  const analyticsUrl: string | undefined = jar.details?.apiKey
    ? "/v2/stats/jar?jar=" + jar.details.apiKey
    : undefined;

  return (
    <td
      colSpan={6}
      className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
    >
      <div className="flex">
        <div className="pt-4 pb-6 flex-shrink-0 mr-6">
          <p className="font-title font-medium text-base leading-5">{depositTokenCountString}</p>
          <p className="font-normal text-xs text-foreground-alt-200 mb-6">
            {t("v2.balances.balance")}
          </p>
          <Link href={jar.depositToken.link} className="font-bold" external primary>
            {t("v2.farms.getToken", { token: jar.depositToken.name })}
          </Link>
          <br />
          {analyticsUrl && (
            <Link href={analyticsUrl as string} className="font-bold" external primary>
              {t("v2.farms.statsAndDocs")}
            </Link>
          )}
        </div>
        <div className="relative w-full mb-2">
          <FarmsTableRowBodyTransactionControls jar={jar} />
          {needsNetworkSwitch && (
            <div className="absolute inset-0 flex grow justify-center items-center border border-foreground-alt-500 rounded-xl bg-background-light bg-opacity-90 backdrop-filter backdrop-blur-sm">
              <ConnectButton network={network} />
            </div>
          )}
        </div>
      </div>
      <FarmsTableRowDetails jar={jar} hideDescription={hideDescription} />
    </td>
  );
};

export default FarmsTableRowBody;

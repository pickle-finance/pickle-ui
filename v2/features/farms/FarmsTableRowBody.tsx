import { FC } from "react";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";
import { useSelector } from "react-redux";

import { useAppSelector } from "v2/store";
import Link from "v2/components/Link";
import Button from "v2/components/Button";
import { CoreSelectors, JarWithData } from "v2/store/core";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices } from "./FarmsTableRowHeader";
import FarmsTableRowDetails from "./FarmsTableRowDetails";
import ApprovalFlow from "./flows/approval/ApprovalFlow";
import ConnectButton from "./ConnectButton";
import DepositFlow from "./flows/deposit/DepositFlow";
import LoadingIndicator from "v2/components/LoadingIndicator";

interface Props {
  jar: JarWithData;
}

const FarmsTableRowBody: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const pfcore = useAppSelector(CoreSelectors.selectCore);
  const userModel = useAppSelector(UserSelectors.selectData);

  const userTokenData = useAppSelector((state) =>
    UserSelectors.selectTokenDataById(state, jar.details.apiKey),
  );
  const userHasJarAllowance = parseInt(userTokenData?.jarAllowance || "0") > 0;
  const isUserModelLoading = useSelector(UserSelectors.selectIsFetching);

  const data = getUserAssetDataWithPrices(jar, pfcore, userModel);
  const jarTokens = data.depositTokensInJar.tokensVisible;
  const farmTokens = data.depositTokensInFarm.tokensVisible;
  const tokensInWallet = data.depositTokensInWallet.tokens;
  const picklesPending = data.earnedPickles.tokensVisible;
  const depositTokenCountString = tokensInWallet + " Tokens";

  const networks = useAppSelector(CoreSelectors.selectNetworks);
  const { chainId } = useWeb3React();

  const activeNetwork = networks?.find((network) => network.chainId === chainId);
  const isJarOnActiveNetwork = jar.chain === activeNetwork?.name;
  const jarNetwork = networks?.find((network) => network.name === jar.chain);
  const analyticsUrl: string | undefined = jar.details?.apiKey
    ? "/v2/stats/jar?jar=" + jar.details.apiKey
    : undefined;

  return (
    <td
      colSpan={6}
      className="bg-background-light rounded-b-xl p-6 border-t border-foreground-alt-500"
    >
      <div className="block sm:flex">
        <div className="py-4 flex-shrink-0 sm:mr-6">
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
              {t("v2.farms.analytics")}
            </Link>
          )}
        </div>
        <div className="grow border self-start border-foreground-alt-500 rounded-xl p-4 mb-2 sm:mb-0 sm:mr-6">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.depositedToken", { token: jar.depositToken.name })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {jarTokens}
            </span>
            {isJarOnActiveNetwork ? (
              <>
                <ApprovalFlow jar={jar} visible={!userHasJarAllowance} />
                <DepositFlow jar={jar} visible={userHasJarAllowance} />
              </>
            ) : (
              <ConnectButton network={jarNetwork} />
            )}
          </div>
        </div>
        <div className="grow border self-start border-foreground-alt-500 rounded-xl p-4 mb-2 sm:mb-0 sm:mr-6">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.stakedToken", { token: jar.depositToken.name })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {farmTokens}
            </span>
            <div className="grid grid-cols-2 gap-3">
              <Button type="secondary" state="disabled" className="w-11">
                +
              </Button>
              <Button type="secondary" state="disabled" className="w-11">
                -
              </Button>
            </div>
          </div>
        </div>
        <div className="grow self-start">
          <div className="border border-foreground-alt-500 rounded-xl p-4">
            <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
              {t("v2.farms.earnedToken", { token: "PICKLEs" })}
            </p>
            <div className="flex items-end justify-between">
              <span className="font-title text-primary font-medium text-base leading-5">
                {picklesPending}
              </span>
              <Button type="primary" state="disabled">
                {t("v2.farms.harvest")}
              </Button>
            </div>
          </div>
          <div className="relative">
            {isUserModelLoading && (
              <LoadingIndicator waitForUserModel className="absolute r-0 t-0 mt-3" />
            )}
          </div>
        </div>
      </div>
      <FarmsTableRowDetails jar={jar} />
    </td>
  );
};

export default FarmsTableRowBody;

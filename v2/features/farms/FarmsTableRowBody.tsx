import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

import Link from "v2/components/Link";
import Button from "v2/components/Button";
import MoreInfo from "v2/components/MoreInfo";
import { useSelector } from "react-redux";
import { CoreSelectors } from "v2/store/core";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { UserSelectors } from "v2/store/user";
import { getUserAssetDataWithPrices } from "./FarmsTableRowHeader";
import { ChainNetwork } from "picklefinance-core";
import { Network } from "../connection/networks";
import { switchChain } from "../connection/ConnectionStatus";

interface Props {
  jar: JarDefinition;
}

const ConnectButton: FC<{ network: Network | undefined }> = ({ network }) => {
  const { t } = useTranslation("common");
  const { library } = useWeb3React<Web3Provider>();
  const allCore = useSelector(CoreSelectors.selectCore);

  if (!network || !allCore || !library) return null;
  return (
    <Button onClick={() => switchChain(library, network.chainId, allCore)}>
      <span>{t("connection.connectTo")}</span>
      <div className="w-4 h-4 mr-1 ml-1">
        <Image
          src={`/networks/${network.name}.png`}
          width={16}
          height={16}
          layout="intrinsic"
          alt={network.name}
          title={network.name}
          className="rounded-full"
          priority
        />
      </div>
      <span>{network.visibleName}</span>
    </Button>
  );
};

const FarmsTableRowBody: FC<Props> = ({ jar }) => {
  const { t } = useTranslation("common");
  const pfcore = useSelector(CoreSelectors.selectCore);
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);
  const data = getUserAssetDataWithPrices(jar, pfcore, userModel);
  const jarTokens = data.depositTokensInJar.tokensVisible;
  const farmTokens = data.depositTokensInFarm.tokensVisible;
  const tokensInWallet = data.depositTokensInWallet.tokens;
  const picklesPending = data.earnedPickles.tokensVisible;
  const depositTokenCountString = tokensInWallet + " Tokens";

  const networks = useSelector(CoreSelectors.selectNetworks);
  const { chainId } = useWeb3React();

  const activeNetwork = networks?.find(
    (network) => network.chainId === chainId,
  );
  const isJarOnActiveNetwork = jar.chain === activeNetwork?.name;
  const jarNetwork = networks?.find((network) => network.name === jar.chain);
  return (
    <td
      colSpan={6}
      className="bg-background-light rounded-b-xl p-6 border-t border-gray-dark"
    >
      <div className="block sm:flex">
        <div className="py-4 flex-shrink-0 sm:mr-6">
          <p className="font-title font-medium text-base leading-5">
            {depositTokenCountString}
          </p>
          <p className="font-normal text-xs text-foreground-alt-200 mb-6">
            {t("v2.balances.balance")}
          </p>
          <Link
            href={jar.depositToken.link}
            className="font-bold"
            external
            primary
          >
            {t("v2.farms.getToken", { token: jar.depositToken.name })}
          </Link>
        </div>
        <div className="grow border border-gray-dark rounded-xl p-4 mb-2 sm:mb-0 sm:mr-6">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.depositedToken", { token: jar.depositToken.name })}
            <MoreInfo secondaryText="More info" />
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {jarTokens}
            </span>
            {isJarOnActiveNetwork ? (
              <Button>{t("v2.farms.enable")}</Button>
            ) : (
              <ConnectButton network={jarNetwork} />
            )}
          </div>
        </div>
        <div className="grow border border-gray-dark rounded-xl p-4 mb-2 sm:mb-0 sm:mr-6">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.stakedToken", { token: jar.depositToken.name })}
            <MoreInfo secondaryText="More info" />
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {farmTokens}
            </span>
            <Button type="disabled">{t("v2.farms.enable")}</Button>
          </div>
        </div>
        <div className="grow border border-gray-dark rounded-xl p-4">
          <p className="font-title text-foreground-alt-200 font-medium text-base leading-5 mb-2">
            {t("v2.farms.earnedToken", { token: "PICKLEs" })}
          </p>
          <div className="flex items-end justify-between">
            <span className="font-title text-primary font-medium text-base leading-5">
              {picklesPending}
            </span>
            <Button type="disabled">{t("v2.farms.enable")}</Button>
          </div>
        </div>
      </div>
    </td>
  );
};

export default FarmsTableRowBody;

import { FC } from "react";
import Image from "next/image";
import { useTranslation } from "next-i18next";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";

import { useAppSelector } from "v2/store";
import Button, { ButtonSize, ButtonType } from "v2/components/Button";
import { CoreSelectors } from "v2/store/core";
import { Network } from "../connection/networks";
import { switchChain } from "../connection/ConnectionStatus";
import ConnectWalletButton from "../connection/ConnectWalletButton";

interface Props {
  network: Network | undefined;
  size?: ButtonSize;
  type?: ButtonType;
}

const ConnectButton: FC<Props> = ({ size, type, network }) => {
  const { t } = useTranslation("common");
  const { library } = useWeb3React<Web3Provider>();
  const allCore = useAppSelector(CoreSelectors.selectCore);

  if (!network || !allCore || !library) return <ConnectWalletButton />;

  return (
    <Button size={size} type={type} onClick={() => switchChain(library, network.chainId, allCore)}>
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

export default ConnectButton;

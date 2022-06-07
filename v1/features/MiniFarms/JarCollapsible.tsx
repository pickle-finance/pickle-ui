import { BigNumber, ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip, Select } from "@geist-ui/react";

import { Connection } from "../../containers/Connection";
import { formatEther } from "ethers/lib/utils";
import ReactHtmlParser from "react-html-parser";
import { ERC20Transfer, Status as ERC20TransferStatus } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { getFormatString } from "../Gauges/GaugeInfo";
import { uncompoundAPY } from "v1/util/jars";
import { JarApy } from "./MiniFarmList";
import { useTranslation } from "next-i18next";
import { isCroToken, isUsdcToken } from "v1/containers/Jars/jars";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { TokenDetails } from "v1/containers/Jars/useJarsWithZap";
import { formatUnits } from "@ethersproject/units";
import { neverExpireEpochTime } from "v1/util/constants";
import { getRatioStringAndPendingString, RatioAndPendingStrings } from "./JarMiniFarmCollapsible";
import { Jar } from "v1/containers/Contracts/Jar";
import { JarNative } from "v1/containers/Contracts/JarNative";

interface DataProps {
  isZero?: boolean;
}

const Data = styled.div<DataProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => (props.isZero ? "#444" : "unset")};
`;

const Label = styled.div`
  font-family: "Source Sans Pro";
`;
interface ButtonStatus {
  disabled: boolean;
  text: string;
}

const JarName = styled(Grid)({
  display: "flex",
});

// For protocols that share the same deposit token
export const JAR_DEPOSIT_TOKEN_MULTI_FARMS_TO_ICON: {
  [key: string]: { [apiKey: string]: string | ReactNode };
} = {
  // BOO FTM-BOO
  "0xec7178f4c41f346b2721907f5cf7628e388a7a58": {
    "LQDR-BOO-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmboo.png"} />
    ),
    "BOO-FTM-BOO": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmboo.png"} />
    ),
  },
  // BOO FTM-DAI
  "0xe120ffbda0d14f3bb6d6053e90e63c572a66a428": {
    "LQDR-BOO-DAI-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmdai.png"} />
    ),
    "BOO-FTM-DAI": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmdai.png"} />
    ),
  },
  // BOO FTM-USDT
  "0x5965e53aa80a0bcf1cd6dbdd72e6a9b2aa047410": {
    "LQDR-BOO-USDT-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmusdt.png"} />
    ),
    "BOO-USDT-FTM": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmusdt.png"} />
    ),
  },
  // BOO FTM-SUSHI
  "0xf84e313b36e86315af7a06ff26c8b20e9eb443c3": {
    "LQDR-BOO-SUSHI-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmsushi.png"} />
    ),
    "BOO-FTM-SUSHI": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmsushi.png"} />
    ),
  },
  // BOO FTM-MIM
  "0x6f86e65b255c9111109d2d2325ca2dfc82456efc": {
    "LQDR-BOO-MIM-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmmim.png"} />
    ),
    "BOO-FTM-MIM": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmmim.png"} />
    ),
  },
  // BOO FTM-USDC
  "0x2b4c76d0dc16be1c31d4c1dc53bf9b45987fc75c": {
    "LQDR-BOO-USDC-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/usdcftm.png"} />
    ),
    "BOO-USDC-FTM": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/usdcftm.png"} />
    ),
  },
  // BOO FTM-LINK
  "0x89d9bc2f2d091cfbfc31e333d6dc555ddbc2fd29": {
    "LQDR-BOO-LINK-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmlink.png"} />
    ),
    "BOO-FTM-LINK": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmlink.png"} />
    ),
  },
  // BOO FTM-ETH
  "0xf0702249f4d3a25cd3ded7859a165693685ab577": {
    "LQDR-BOO-ETH-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmeth.png"} />
    ),
    "BOO-FTM-ETH": (
      <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmeth.png"} />
    ),
  },
  // SPIRIT FTM-SPIRIT
  "0x30748322b6e34545dbe0788c421886aeb5297789": {
    "LQDR-SPIRIT-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/spiritftm.png"} />
    ),
    "SPIRIT-FTM-SPIRIT": (
      <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/spiritftm.png"} />
    ),
  },
  // SPIRIT FTM-LQDR
  "0x4fe6f19031239f105f753d1df8a0d24857d0caa2": {
    "LQDR-SPIRIT-LQDR-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/lqdrftm.png"} />
    ),
    "SPIRIT-FTM-LQDR": (
      <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/lqdrftm.png"} />
    ),
  },
  // SPIRIT FTM-FRAX
  "0x7ed0cddb9bb6c6dfea6fb63e117c8305479b8d7d": {
    "LQDR-SPIRIT-FRAX-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/fraxftm.png"} />
    ),
    "SPIRIT-FTM-FRAX": (
      <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/fraxftm.png"} />
    ),
  },
  // SPIRIT FTM-DEUS
  "0x2599eba5fd1e49f294c76d034557948034d6c96e": {
    "LQDR-SPIRIT-DEUS-FTM": (
      <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/deusftm.png"} />
    ),
    "SPIRIT-FTM-DEUS": (
      <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/deusftm.png"} />
    ),
  },
  "0xbcab7d083cf6a01e0dda9ed7f8a02b47d125e682": {
    "SEX-SOLID-sUSDC-MIM": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcmim.png"} />
    ),
    "OXDSOLIDLYLP-USDC-MIM": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/usdcmim.png"} />
    ),
  },
  "0xed7fd242ce91a541abcae52f3d617daca7fe6e34": {
    "SEX-SOLID-vFTM-CRV": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/crvwftm.png"} />
    ),
    "OXDSOLIDLYLP-CRV-WFTM": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/crvwftm.png"} />
    ),
  },
  // SOLIDEX VOLATILE FSX-FRAX
  "0x4bbd8467ccd49d5360648ce14830f43a7feb6e45": {
    "SEX-SOLID-vFXS-FRAX": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/fxsfrax.png"} />
    ),
    "OXDSOLIDLYLP-FXS-FRAX": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/fxsfrax.png"} />
    ),
  },
  // SOLIDEX VOLATILE YFI-WOOFY
  "0x4b3a172283ecb7d07ab881a9443d38cb1c98f4d0": {
    "SEX-SOLID-vYFI-WOOFY": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/yfiwoofy.png"} />
    ),
    "OXDSOLIDLYLP-YFI-WOOFY": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/yfiwoofy.png"} />
    ),
  },
  // SOLIDEX VOLATILE USDC-SYN
  "0xb1b3b96cf35435b2518093acd50e02fe03a0131f": {
    "SEX-SOLID-vUSDC-SYN": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcsyn.png"} />
    ),
    "OXDSOLIDLYLP-USDC-SYN": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/usdcsyn.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-YFI
  "0xea5f4ecf6900833f9b7038e5d8d67142abb09dcc": {
    "SEX-SOLID-vFTM-YFI": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmyfi.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-YFI": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmyfi.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-MULTI
  "0x94be7e51efe2a0c06c2281b6b385fcd12c84d6f9": {
    "SEX-SOLID-vFTM-MULTI": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmmulti.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-MULTI": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmmulti.png"} />
    ),
  },
  // SOLIDEX STABLE SOLIDSEX-SOLID
  "0x62e2819dd417f3b430b6fa5fd34a49a377a02ac8": {
    "SEX-SOLID-sSOLID-SOLIDSEX": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/solidsolidsex.png"} />
    ),
    "OXDSOLIDLYLP-SOLIDSEX-SOLID": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/solidsolidsex.png"} />
    ),
  },
  // SOLIDEX VOLATILE LQDR-WFTM
  "0x9861b8a9acc9b4f249981164bfe7f84202068bfe": {
    "SEX-SOLID-vFTM-LQDR": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/lqdrwftm.png"} />
    ),
    "OXDSOLIDLYLP-LQDR-WFTM": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/lqdrwftm.png"} />
    ),
  },
  // SOLIDEX VOLATILE HND-WFTM
  "0x6aae93f2915b899e87b49a9254434d36ac9570d8": {
    "SEX-SOLID-vFTM-HND": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/hndwftm.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-HND": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/hndwftm.png"} />
    ),
  },
  // SOLIDEX VOLATILE IB-WFTM
  "0x304b61f3481c977ffbe630b55f2abeee74792664": {
    "SEX-SOLID-vFTM-IB": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/ibwftm.png"} />
    ),
    "OXDSOLIDLYLP-IB-WFTM": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/ibwftm.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-GEIST
  "0xae885ef155f2835dce9c66b0a7a3a0c8c0622aa1": {
    "SEX-SOLID-vFTM-GEIST": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmgeist.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-GEIST": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmgeist.png"} />
    ),
  },
  // SOLIDEX VOLATILE BIFI-MAI
  "0x8aeb0503e13f7bea02f80986a8fdb2acce5c6b6c": {
    "SEX-SOLID-vBIFI-MAI": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/bifimai.png"} />
    ),
    "OXDSOLIDLYLP-BIFI-MAI": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/bifimai.png"} />
    ),
  },
  // SOLIDEX VOLATILE CRV-G3CRV
  "0x6ca598726d7c9ed382a101789c5f086f7165efa1": {
    "SEX-SOLID-vCRV-G3CRV": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/crvg3crv.png"} />
    ),
    "OXDSOLIDLYLP-CRV-G3CRV": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/crvg3crv.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-SOLIDSEX
  "0xa66901d1965f5410deeb4d0bb43f7c1b628cb20b": {
    "SEX-SOLID-vFTM-SOLIDSEX": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmsolidsex.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-SOLIDSEX": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmsolidsex.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-SYN
  "0x8aa410d8b0cc3de48aac8eb5d928646a00e6ff04": {
    "SEX-SOLID-vFTM-SYN": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmsyn.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-SYN": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmsyn.png"} />
    ),
  },
  // SOLIDEX VOLATILE TAROT-XTAROT
  "0x4fe782133af0f7604b9b89bf95893adde265fefd": {
    "SEX-SOLID-vTAROT-XTAROT": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/tarotxtarot.png"} />
    ),
    "OXDSOLIDLYLP-XTAROT-TAROT": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/tarotxtarot.png"} />
    ),
  },
  // SOLIDEX STABLE USDC-DEI
  "0x5821573d8f04947952e76d94f3abc6d7b43bf8d0": {
    "SEX-SOLID-sUSDC-DEI": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcdei.png"} />
    ),
    "OXDSOLIDLYLP-USDC-DEI": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/usdcdei.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-RDL
  "0x5ef8f0bd4f071b0199603a28ec9343f3651999c0": {
    "SEX-SOLID-vFTM-RDL": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmrdl.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-RDL": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmrdl.png"} />
    ),
  },
  // SOLIDEX STABLE SPIRIT-RAINSPIRIT
  "0xca395560b6003d921d9408af011c6c61399f66ca": {
    "SEX-SOLID-sSPIRIT-RAINSPIRIT": (
      <LpIcon
        swapIconSrc={"/protocols/solidex.png"}
        tokenIconSrc={"/tokens/spiritrainspirit.png"}
      />
    ),
    "OXDSOLIDLYLP-SPIRIT-RAINSPIRIT": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/spiritrainspirit.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-SOLID
  "0xe4bc39fdd4618a76f6472079c329bdfa820afa75": {
    "SEX-SOLID-vFTM-SOLID": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmsolid.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-SOLID": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmsolid.png"} />
    ),
  },
  // SOLIDEX STABLE SPIRIT-SINSPIRIT
  "0x742c384d6edec91466042ba84e5e751c4eaff962": {
    "SEX-SOLID-sSPIRIT-SINSPIRIT": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/spiritsinspirit.png"} />
    ),
    "OXDSOLIDLYLP-SPIRIT-SINSPIRIT": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/spiritsinspirit.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-SCREAM
  "0x86dd79265814756713e631dde7e162bdd538b7b1": {
    "OXDSOLIDLYLP-WFTM-SCREAM": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmscream.png"} />
    ),
  },
  // SOLIDEX VOLATILE WFTM-TAROT
  "0x783f1edbe336981dfcb74bd0b803655f55aadf48": {
    "SEX-SOLID-vFTM-TAROT": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmtarot.png"} />
    ),
    "OXDSOLIDLYLP-WFTM-TAROT": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/wftmtarot.png"} />
    ),
  },
  // SOLIDEX VOLATILE FTM-SEX
  "0xfcec86af8774d69e2e4412b8de3f4abf1f671ecc": {
    "SEX-SOLID-vFTM-SEX": (
      <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/ftmsex.png"} />
    ),
    "OXDSOLIDLYLP-SEX-WFTM": (
      <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/ftmsex.png"} />
    ),
  },
};
export const JAR_DEPOSIT_TOKEN_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  // OKEx
  // Please ensure addresses are lowercased
  "0x8e68c0216562bcea5523b27ec6b9b6e1cccbbf88": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/okex.png"} />
  ),
  "0x089dedbfd12f2ad990c55a2f1061b8ad986bff88": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x407f7a2f61e5bab199f7b9de0ca330527175da93": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/ethereum.png"} />
  ),
  "0xf3098211d012ff5380a03d80f150ac6e5753caa8": (
    <LpIcon swapIconSrc={"/cherryswap.png"} tokenIconSrc={"/okex.png"} />
  ),
  "0x8009edebbbdeb4a3bb3003c79877fcd98ec7fb45": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x838a7a7f3e16117763c109d98c79ddcd69f6fd6e": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/wbtc.png"} />
  ),
  "0xeb02a695126b998e625394e43dfd26ca4a75ce2b": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xe9313b7dea9cbabd2df710c25bef44a748ab38a9": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0xa25e1c05c58ede088159cc3cd24f49445d0be4b2": (
    <LpIcon swapIconSrc={"/jswap.png"} tokenIconSrc={"/usdc.png"} />
  ),

  // Moonriver
  "0x7eda899b3522683636746a2f3a7814e6ffca75e1": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/moonriver.png"} />
  ),
  "0xfe1b71bdaee495dca331d28f5779e87bd32fbe53": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/daiusdc.png"} />
  ),
  "0xe537f70a8b62204832b8ba91940b77d3f79aeb81": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/usdcmovr.png"} />
  ),
  "0xdb66be1005f5fe1d2f486e75ce3c50b52535f886": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x2a44696ddc050f14429bd8a4a05c750c6582bf3b": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  "0x384704557f73fbfae6e9297fd1e6075fc340dbe5": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/busd.png"} />
  ),
  "0xa0d8dfb2cc9dfe6905edd5b71c56ba92ad09a3dc": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xfb1d0d6141fc3305c63f189e39cc2f2f7e58f4c2": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/bnb.png"} />
  ),
  "0x83d7a3fc841038e8c8f46e6192bbcca8b19ee4e7": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/wbtc.png"} />
  ),
  "0xb9a61ac826196abc69a3c66ad77c563d6c5bdd7b": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/avax.png"} />
  ),
  "0x55ee073b38bf1069d5f1ed0aa6858062ba42f5a9": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0x9051fb701d6d880800e397e5b5d46fddfadc7056": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0x1eebed8f28a6865a76d91189fd6fc45f4f774d67": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/fantom.png"} />
  ),
  "0x9e0d90ebb44c22303ee3d331c0e4a19667012433": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/relay.png"} />
  ),
  "0xf9b7495b833804e4d894fc5f7b39c10016e0a911": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/rib.png"} />
  ),
  "0x9f9a7a3f8f56afb1a2059dae1e978165816cea44": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/pets.png"} />
  ),
  "0x0acdb54e610dabc82b8fa454b21ad425ae460df9": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/rib.png"} />
  ),
  "0x9432b25fbd8a37e5a1300e36a96bd14e1e6f5c90": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0x2cc54b4a3878e36e1c754871438113c1117a3ad7": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/frax.webp"} />
  ),
  "0xbe2abe58edaae96b4303f194d2fad5233bad3d87": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/bnb.png"} />
  ),
  "0x0d171b55fc8d3bddf17e376fdb2d90485f900888": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xf09211fb5ed5019b072774cfd7db0c9f4ccd5be0": (
    <LpIcon swapIconSrc={"/finn.png"} tokenIconSrc={"/tokens/dotfinn.png"} />
  ),
  "0x14be4d09c5a8237403b83a8a410bace16e8667dc": (
    <LpIcon swapIconSrc={"/finn.png"} tokenIconSrc={"/tokens/finnksm.png"} />
  ),
  "0xd9e98ad7ae9e5612b90cd0bdcd82df4fa5b943b8": (
    <LpIcon swapIconSrc={"/finn.png"} tokenIconSrc={"/tokens/finnrmrk.png"} />
  ),
  "0xbbe2f34367972cb37ae8dea849ae168834440685": (
    <LpIcon swapIconSrc={"/finn.png"} tokenIconSrc={"/tokens/movrfinn.png"} />
  ),
  "0x7128c61da34c27ead5419b8eb50c71ce0b15cd50": (
    <LpIcon swapIconSrc={"/finn.png"} tokenIconSrc={"/usdcmovr.png"} />
  ),
  "0x493147c85fe43f7b056087a6023df32980bcb2d1": (
    <LpIcon swapIconSrc={"/solar.png"} tokenIconSrc={"/tokens/stksm.png"} />
  ),

  // Cronos
  "0x1803e360393a472bec6e1a688bdf7048d3076b1a": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/beefy.png"} />
  ),
  "0x3eb9ff92e19b73235a393000c176c8bb150f1b20": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0xc9ea98736dbc94faa91abf9f4ad1eb41e7fb40f4": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/shib.png"} />
  ),
  "0xe61db569e231b3f5530168aa2c9d50246525b6d6": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/cronos.png"} />
  ),
  "0x3d2180db9e1b909f35c398bc39ef36108c0fc8c3": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/cronos.png"} />
  ),
  "0x814920d1b8007207db6cb5a2dd92bf0b082bdba1": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x280acad550b2d3ba63c8cbff51b503ea41a1c61b": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xbf62c67ea509e86f07c8c69d0286c0636c50270b": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/cronos.png"} />
  ),
  "0x8f09fff247b8fdb80461e5cf5e82dd1ae2ebd6d7": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/wbtc.png"} />
  ),
  "0x39cc0e14795a8e6e9d02a21091b81fe0d61d82f9": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/cronos.png"} />
  ),
  "0xa111c17f8b8303280d3eb01bbcd61000aa7f39f9": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/weth.png"} />
  ),

  "0x2a560f2312cb56327ad5d65a03f1bfec10b62075": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/tokens/doge.png"} />
  ),
  "0x9e5bd780dff875dd85848a65549791445ae25de0": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/tokens/atom.png"} />
  ),
  "0x4b377121d968bf7a62d51b96523d59506e7c2bf0": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"tokens/tonic.png"} />
  ),
  "0x6f72a3f6db6f486b50217f6e721f4388994b1fbe": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/singlevvs.png"} />
  ),
  "0x0fbab8a90cac61b481530aad3a64fe17b322c25d": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/singleusdc.png"} />
  ),
  "0xa922530960a1f94828a7e132ec1ba95717ed1eab": (
    <LpIcon swapIconSrc={"/vvs.png"} tokenIconSrc={"/tokens/tonic.png"} />
  ),

  "0xe44fd7fcb2b1581822d0c862b68222998a0c299a": (
    <LpIcon swapIconSrc={"/protocols/tectonic.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23": (
    <LpIcon swapIconSrc={"/protocols/tectonic.png"} tokenIconSrc={"/cronos.png"} />
  ),

  // Aurora
  "0x20f8aefb5697b77e0bb835a8518be70775cda1b0": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/nearusdc.png"} />
  ),
  "0x63da4db6ef4e7c62168ab03982399f9588fcd198": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/neareth.png"} />
  ),
  "0xbc8a244e8fb683ec1fd6f88f3cc6e565082174eb": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  "0x03b666f3488a7992b2385b12df7f35156d7b29cd": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/nearusdt.png"} />
  ),
  "0x84b123875f0f36b966d0b6ca14b31121bd9676ad": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/near.png"} />
  ),
  "0x2fe064b6c7d274082aa5d2624709bc9ae7d16c77": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  "0xd1654a7713617d41a8c9530fb9b948d00e162194": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/auroratri.png"} />
  ),
  "0x5eec60f348cb1d661e4a5122cf4638c7db7a886e": (
    <LpIcon swapIconSrc={"/trisolaris.png"} tokenIconSrc={"/auroraeth.png"} />
  ),
  "0xbf9eef63139b67fd0abf22bd5504acb0519a4212": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/near.png"} />
  ),
  "0xca461686c711aeaadf0b516f9c2ad9d9b645a940": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x523fae29d7ff6fd38842c8f271edf2ebd3150435": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x7e9ea10e5984a09d19d05f31ca3cb65bb7df359d": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/auroranear.png"} />
  ),
  "0x2e02bea8e9118f7d2ccada1d402286cc6d54bd67": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/nearusdt.png"} />
  ),
  "0xbf560771b6002a58477efbcdd6774a5a1947587b": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/nearusdc.png"} />
  ),
  "0xbf58062d23f869a90c6eb04b9655f0dfca345947": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  "0xe6c47b036f6fd0684b109b484ac46094e633af2e": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/neardai.png"} />
  ),
  "0x256d03607eee0156b8a2ab84da1d5b283219fe97": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/neareth.png"} />
  ),
  "0xf56997948d4235514dcc50fc0ea7c0e110ec255d": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/ethbtc.png"} />
  ),
  "0x3502eac6fa27beebdc5cd3615b7cb0784b0ce48f": (
    <LpIcon swapIconSrc={"/wanna.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),

  "0xa188d79d6bdbc1120a662de9eb72384e238af104": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/nearwbtc.png"} />
  ),
  "0x73155e476d6b857fe7722aefebad50f9f8bd0b38": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x1fd6cbbfc0363aa394bd77fc74f64009bf54a7e9": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0x63b4a0538ce8d90876b201af1020d13308a8b253": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/weth.png"} />
  ),
  "0xc374776cf5c497adeef6b505588b00cb298531fd": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/near.png"} />
  ),
  "0xb53bc2537e641c37c7b7a8d33aba1b30283cda2f": (
    <LpIcon swapIconSrc={"/nearpad.png"} tokenIconSrc={"/frax.webp"} />
  ),

  // Metis
  // NET NETT/METIS
  "0x60312d4ebbf3617d3d33841906b5868a86931cbd": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/metis.png"} />
  ),
  // NET BNB/NETT
  "0x3bf77b9192579826f260bc48f2214dfba840fce5": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/bnbnett.png"} />
  ),
  // NET ETH/METIS
  "0x59051b5f5172b69e66869048dc69d35db0b3610d": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/ethmetis.png"} />
  ),
  // NET ETH/NETT
  "0xc8ae82a0ab6ada2062b812827e1556c0fa448dd0": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/ethereum.png"} />
  ),
  // NET ETH/USDC
  "0xf5988809ac97c65121e2c34f5d49558e3d12c253": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/ethusdc.png"} />
  ),
  // NET ETH/USDT
  "0x4db4ce7f5b43a6b455d3c3057b63a083b09b8376": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/ethusdt.png"} />
  ),
  // NET METIS/USDC
  "0x5ae3ee7fbb3cb28c17e7adc3a6ae605ae2465091": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/metisusdc.png"} />
  ),
  // NET NETT/USDC
  "0x0724d37522585e87d27c802728e824862dc72861": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  // NET NETT/USDT
  "0x7d02ab940d7dd2b771e59633bbc1ed6ec2b99af1": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  // NET USDT/METIS
  "0x3d60afecf67e6ba950b499137a72478b2ca7c5a1": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/metisusdt.png"} />
  ),
  // NET USDT/USDC
  "0x1cad5f8f5d4c0ad49646b2565cc0ca725e4280ea": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  // NET BYTE/USDC
  "0x3ab6be89ed5a0d4fdd412c246f5e6ddd250dd45c": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/byteusdc.png"} />
  ),
  // NET BUSD/USDC
  "0x8014c801f6cf32445d503f7bac30976b3161ee52": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/busdusdc.png"} />
  ),
  // NET METIS/RELAY
  "0xa58bd557bfbc12f8ceaccc6e1668f5fbfb2118bb": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/relay.png"} />
  ),

  // NET BYTE/USDC
  "0x3Ab6be89ED5A0d4FDD412c246F5e6DdD250Dd45c": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/byteusdc.png"} />
  ),
  // NET BUSD/USDC
  "0x8014c801F6cF32445D503f7BaC30976B3161eE52": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/byteusdc.png"} />
  ),
  // TETHYS TETHYS/METIS
  "0xc9b290ff37fa53272e9d71a0b13a444010af4497": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/metis.png"} />
  ),
  // TETHYS ETH/METIS
  "0xee5adb5b0dfc51029aca5ad4bc684ad676b307f7": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/ethmetis.png"} />
  ),
  // TETHYS METIS/USDC
  "0xdd7df3522a49e6e1127bf1a1d3baea3bc100583b": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/metisusdc.png"} />
  ),
  // TETHYS USDT/METIS
  "0x8121113eb9952086dec3113690af0538bb5506fd": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/metisusdt.png"} />
  ),
  // TETHYS USDT/METIS
  "0x586f616bb811f1b0dfa953fbf6de3569e7919752": (
    <LpIcon swapIconSrc={"/hades.svg"} tokenIconSrc={"/metis.png"} />
  ),
  // TETHYS USDT/METIS
  "0xcd1cc85dc7b4deef34247ccb5d7c42a58039b1ba": (
    <LpIcon swapIconSrc={"/hellshare.svg"} tokenIconSrc={"/metis.png"} />
  ),
  // NETSWAP HERA/USDC
  "0x948f9614628d761f86b672f134fc273076c4d623": (
    <LpIcon swapIconSrc={"/netswap.png"} tokenIconSrc={"/tokens/hera.png"} />
  ),
  // TETHYS METIS/AVAX
  "0x3ca47677e7d8796e6470307ad15c1fbfd43f0d6f": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/avax.png"} />
  ),
  // TETHYS METIS/FTM
  "0x74ca39f7ab9b685b8ea8c4ab19e7ab6b474dd22d": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/fantom.png"} />
  ),
  // TETHYS METIS/DAI
  "0xcc15d8f93be780ad78fd1a016fb0f15f2543b5dc": (
    <LpIcon swapIconSrc={"/tethys.png"} tokenIconSrc={"/dai.png"} />
  ),
  // HUMMUS USDC
  "0x9e3f3be65fec3731197aff816489eb1eb6e6b830": (
    <LpIcon swapIconSrc={"/protocols/hummus.png"} tokenIconSrc={"/usdc.png"} />
  ),
  // HUMMUS DAI
  "0xd5a0760d55ad46b6a1c46d28725e4c117312a7ad": (
    <LpIcon swapIconSrc={"/protocols/hummus.png"} tokenIconSrc={"/dai.png"} />
  ),
  // HUMMUS USDT
  "0x9f51f0d7f500343e969d28010c7eb0db1bcaaef9": (
    <LpIcon swapIconSrc={"/protocols/hummus.png"} tokenIconSrc={"/usdt.png"} />
  ),

  // Moonbeam

  // STELLA STELLA/GLMR
  "0x7f5ac0fc127bcf1eaf54e3cd01b00300a0861a62": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/moonbeam.png"} />
  ),
  // STELLA USDC/BNB
  "0xac2657ba28768fe5f09052f07a9b7ea867a4608f": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/usdcbnb.png"} />
  ),
  // STELLA BUSD/GLMR
  "0x367c36dae9ba198a4fee295c22bc98cb72f77fe1": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/busdglmr.png"} />
  ),
  // STELLA USDC/DAI
  "0x5ced2f8dd70dc25cba10ad18c7543ad9ad5aeedd": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/daiusdc.png"} />
  ),
  // STELLA GLMR/ETH
  "0x49a1cc58dcf28d0139daea9c18a3ca23108e78b3": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/glmreth.png"} />
  ),
  // STELLA GLMR/USDC
  "0x555b74dafc4ef3a5a1640041e3244460dc7610d1": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/glmrusdc.png"} />
  ),
  // STELLA STELLA/USDC
  "0x81e11a9374033d11cc7e7485a7192ae37d0795d6": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/usdc.png"} />
  ),
  // STELLA USDT/USDC
  "0x8bc3cceef43392b315ddd92ba30b435f79b66b9e": (
    <LpIcon swapIconSrc={"/stella.png"} tokenIconSrc={"/usdcusdt.png"} />
  ),
  // BEAM BNB/BUSD
  "0x34a1f4ab3548a92c6b32cd778eed310fcd9a340d": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/bnbbusd.png"} />
  ),
  // BEAM BUSD/GLMR
  "0xfc422eb0a2c7a99bad330377497fd9798c9b1001": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/busdglmr.png"} />
  ),
  // BEAM BUSD/USDC
  "0xa0799832fb2b9f18acf44b92fbbedcfd6442dd5e": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/busdusdc.png"} />
  ),
  // BEAM ETH/USDC
  "0x6ba3071760d46040fb4dc7b627c9f68efaca3000": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/ethusdc.png"} />
  ),
  // BEAM GLMR/GLINT
  "0x99588867e817023162f4d4829995299054a5fc57": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/tokens/glmr.png"} />
  ),
  // BEAM GLMR/USDC
  "0xb929914b89584b4081c7966ac6287636f7efd053": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/glmrusdc.png"} />
  ),
  // BEAM USDC/USDT
  "0xa35b2c07cb123ea5e1b9c7530d0812e7e03ec3c1": (
    <LpIcon swapIconSrc={"/beamswap.webp"} tokenIconSrc={"/usdcusdt.png"} />
  ),

  // FLARE FLARE/GLMR
  "0x26a2abd79583155ea5d34443b62399879d42748a": (
    <LpIcon swapIconSrc={"/flare.png"} tokenIconSrc={"/tokens/glmr.png"} />
  ),
  // FLARE FLARE/USDC
  "0x976888647affb4b2d7ac1952cb12ca048cd67762": (
    <LpIcon swapIconSrc={"/flare.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),
  // FLARE GLMR/MOVR
  "0xa65949fa1053903fcc019ac21b0335aa4b4b1bfa": (
    <LpIcon swapIconSrc={"/flare.png"} tokenIconSrc={"/tokens/movr.png"} />
  ),
  // FLARE GLMR/USDC
  "0xab89ed43d10c7ce0f4d6f21616556aecb71b9c5f": (
    <LpIcon swapIconSrc={"/flare.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),
  // FLARE GLMR/ETH
  "0xb521c0acf67390c1364f1e940e44db25828e5ef9": (
    <LpIcon swapIconSrc={"/flare.png"} tokenIconSrc={"/tokens/eth.png"} />
  ),
  // FLARE GLMR/WBTC
  "0xdf74d67a4fe29d9d5e0bfaab3516c65b21a5d7cf": (
    <LpIcon swapIconSrc={"/flare.png"} tokenIconSrc={"/tokens/wbtc.png"} />
  ),

  //Optimism

  //ZIP ETH/BTC
  "0x251de0f0368c472bba2e1c8f5db5ac7582b5f847": (
    <LpIcon swapIconSrc={"/zipswap.webp"} tokenIconSrc={"/ethbtc.png"} />
  ),
  //ZIP ETH/DAI
  "0x53790b6c7023786659d11ed82ee03079f3bd6976": (
    <LpIcon swapIconSrc={"/zipswap.webp"} tokenIconSrc={"/ethdai.png"} />
  ),
  //ZIP ETH/USDC
  "0x1a981daa7967c66c3356ad044979bc82e4a478b9": (
    <LpIcon swapIconSrc={"/zipswap.webp"} tokenIconSrc={"/ethusdc.png"} />
  ),
  //ZIP ETH/ZIP
  "0xd7f6ecf4371eddbd60c1080bfaec3d1d60d415d0": (
    <LpIcon swapIconSrc={"/zipswap.webp"} tokenIconSrc={"/ethzip.png"} />
  ),
  //STG USDC
  "0xdecc0c09c3b5f6e92ef4184125d5648a66e35298": (
    <LpIcon swapIconSrc={"/protocols/stargate.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),

  // Fantom

  //BOO FTM-ICE
  "0x623ee4a7f290d11c11315994db70fb148b13021d": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmice.png"} />
  ),
  //BOO FTM-SPELL
  "0x78f82c16992932efdd18d93f889141ccf326dbc2": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmspell.png"} />
  ),
  //BOO CRV-FTM
  "0xb471ac6ef617e952b84c6a9ff5de65a9da96c93b": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/crvftm.png"} />
  ),
  //BOO FTM-AVAX
  "0x5df809e410d9cc577f0d01b4e623c567c7ad56c1": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmavax.png"} />
  ),
  //BOO FTM-ETH
  "0xf0702249f4d3a25cd3ded7859a165693685ab577": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmeth.png"} />
  ),
  //BOO FTM-BNB
  "0x956de13ea0fa5b577e4097be837bf4ac80005820": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmbnb.png"} />
  ),
  //BOO YFI-ETH
  "0x0845c0bfe75691b1e21b24351aac581a7fb6b7df": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/yfieth.png"} />
  ),
  //BOO FTM-TREEB
  "0xe8b72a866b8d59f5c13d2adef96e40a3ef5b3152": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmtreeb.png"} />
  ),
  //BOO FTM-ANY
  "0x5c021d9cfad40aafc57786b409a9ce571de375b4": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmany.png"} />
  ),
  //BOO FTM-MATIC
  "0x7051c6f0c1f1437498505521a3bd949654923fe1": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmatic.png"} />
  ),
  //BOO FTM-BTC
  "0xfdb9ab8b9513ad9e419cf19530fee49d412c3ee3": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/tokens/ftmbtc.png"} />
  ),
  //BOO BTC-ETH
  "0xec454eda10accdd66209c57af8c12924556f3abd": (
    <LpIcon swapIconSrc={"/protocols/spookyswap.png"} tokenIconSrc={"/ethbtc.png"} />
  ),
  //LQDR SPIRIT MIM-FTM
  "0xb32b31dfafbd53e310390f641c7119b5b9ea0488": (
    <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/mimftm.png"} />
  ),
  //LQDR SPIRIT USDC-FTM
  "0xe7e90f5a767406eff87fdad7eb07ef407922ec1d": (
    <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/usdcftm.png"} />
  ),
  //LQDR SPIRIT PILLS-FTM
  "0x9c775d3d66167685b2a3f4567b548567d2875350": (
    <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/pillftm.png"} />
  ),
  //LQDR SPIRIT ETH-FTM
  "0x613bf4e46b4817015c01c6bb31c7ae9edaadc26e": (
    <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/ftmeth.png"} />
  ),
  //LQDR SPIRIT DEI-USDC
  "0x8efd36aa4afa9f4e157bec759f1744a7febaea0e": (
    <LpIcon swapIconSrc={"/protocols/liquiddriver.png"} tokenIconSrc={"/tokens/usdcdei.png"} />
  ),
  //BEETS FTM-BEETS
  "0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1": (
    <LpIcon swapIconSrc={"/protocols/beethovenx.png"} tokenIconSrc={"/tokens/ftmbeets.png"} />
  ),
  //BEETS BTC-ETH-FTM
  "0xd47d2791d3b46f9452709fa41855a045304d6f9d": (
    <LpIcon swapIconSrc={"/protocols/beethovenx.png"} tokenIconSrc={"/tokens/ftmethbtc.png"} />
  ),
  //BEETS LQDR-FTM
  "0x5e02ab5699549675a6d3beeb92a62782712d0509": (
    <LpIcon swapIconSrc={"/protocols/beethovenx.png"} tokenIconSrc={"/tokens/lqdrftm.png"} />
  ),
  //BEETS FTM-MATIC-SOL-AVAX-LUNA-BNB
  "0x9af1f0e9ac9c844a4a4439d446c1437807183075": (
    <LpIcon
      swapIconSrc={"/protocols/beethovenx.png"}
      tokenIconSrc={"/tokens/ftmmaticsolavaxlunabnb.png"}
    />
  ),
  //BEETS FTM-USDC
  "0xcdf68a4d525ba2e90fe959c74330430a5a6b8226": (
    <LpIcon swapIconSrc={"/protocols/beethovenx.png"} tokenIconSrc={"/tokens/usdcftm.png"} />
  ),
  //BEETS USDC-DAI-MAI
  "0x2c580c6f08044d6dfaca8976a66c8fadddbd9901": (
    <LpIcon swapIconSrc={"/protocols/beethovenx.png"} tokenIconSrc={"/tokens/usdcdaimai.png"} />
  ),
  //BEETS USDC-FTM-BTC-ETH
  "0xf3a602d30dcb723a74a0198313a7551feaca7dac": (
    <LpIcon swapIconSrc={"/protocols/beethovenx.png"} tokenIconSrc={"/tokens/usdcftmbtceth.png"} />
  ),
  // SPIRIT FTM-TREEB
  "0x2ceff1982591c8b0a73b36d2a6c2a6964da0e869": (
    <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/ftmtreeb.png"} />
  ),
  // SPIRIT FTM-MAI
  "0x51eb93ecfeffbb2f6fe6106c4491b5a0b944e8bd": (
    <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/ftmmai.png"} />
  ),
  // SPIRIT FTM-CRE8R
  "0x459e7c947e04d73687e786e4a48815005dfbd49a": (
    <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/ftmcre8r.png"} />
  ),
  // SPIRIT FTM-BIFI
  "0xc28cf9aebfe1a07a27b3a4d722c841310e504fe3": (
    <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/ftmbifi.png"} />
  ),
  // SPIRIT GSCARAB-SCARAB
  "0x8e38543d4c764dbd8f8b98c73407457a3d3b4999": (
    <LpIcon swapIconSrc={"/protocols/spiritswap.png"} tokenIconSrc={"/tokens/gscarabscarab.png"} />
  ),
  // SOLIDEX VOLATILE WFTM-TOMB
  "0x60a861cd30778678e3d613db96139440bd333143": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmtomb.png"} />
  ),
  // SOLIDEX VOLATILE USDC-OXD
  "0xeafb5ae6eea34954ee5e5a27b068b8705ce926a6": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcoxd.png"} />
  ),
  // SOLIDEX VOLATILE OATH-WFTM
  "0x6b987e02ca5eae26d8b2bcac724d4e03b3b0c295": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/oathwftm.png"} />
  ),
  // SOLIDEX VOLATILE WFTM-BEFTM
  "0x387a11d161f6855bd3c801ba6c79fe9b824ce1f3": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmbeftm.png"} />
  ),
  // SOLIDEX VOLATILE WFTM-SOLIDSEX
  "0xa66901d1965f5410deeb4d0bb43f7c1b628cb20b": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmsolidsex.png"} />
  ),
  // SOLIDEX VOLATILE WFTM-FRAX
  "0x9ae95682bde174993ecb818cc23e8607d2e54667": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/wftmfrax.png"} />
  ),
  // SOLIDEX STABLE USDC-DAI
  "0xc0240ee4405f11efb87a00b432a8be7b7afc97cc": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcdai.png"} />
  ),
  // SOLIDEX VOLATILE G3CRV-GEIST
  "0x6c90b69af6dbd929458497a8d1013aa255ac71f1": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/g3crvgeist.png"} />
  ),
  // SOLIDEX VOLATILE USDC-WFTM
  "0xbad7d3df8e1614d985c3d9ba9f6ecd32ae7dc20a": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcwftm.png"} />
  ),
  // SOLIDEX STABLE SPIRIT-RAINSPIRIT
  "0xca395560b6003d921d9408af011c6c61399f66ca": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/spiritrainspirit.png"} />
  ),
  // SOLIDEX STABLE SPIRIT-LINSPIRIT
  "0xd6be7592e5c424623c8c9557738970ae19ab5de2": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/spiritlinspirit.png"} />
  ),
  // SOLIDEX STABLE SPIRIT-SINSPIRIT
  "0x742c384d6edec91466042ba84e5e751c4eaff962": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/spiritsinspirit.png"} />
  ),
  // SOLIDEX STABLE SPIRIT-BINSPIRIT
  "0xa7ea870dc93ffb712ca74b43efca9b07556d1303": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/spiritbinspirit.png"} />
  ),
  // SOLIDEX VOLATILE USDC-DAI
  "0x4e9b80f91e954ae532ff765822fcb5a6bc36caa6": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/usdcdai.png"} />
  ),
  // SOLIDEX VOLATILE CRE8R-BOMB
  "0x6058345a4d8b89ddac7042be08091f91a404b80b": (
    <LpIcon swapIconSrc={"/protocols/solidex.png"} tokenIconSrc={"/tokens/cre8rbomb.png"} />
  ),
  // StrategyOxdVolatileBeetsFbeetsLp
  "0x5a3aa3284ee642152d4a2b55be1160051c5eb932": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/beetsfbeets.png"} />
  ),
  // StrategyOxdVolatileSolidOxsolidLp
  "0xa3bf7336fdbce054c4b5bad4ff8d79539db2a2b3": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/solidoxsolid.png"} />
  ),
  // StrategyOxdVolatileDeiScreamLp
  "0xd11e940c42e03d927cfd7426718bb4ca21d6015f": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/deiscream.png"} />
  ),
  // StrategyOxdVolatileOxdDeiLp
  "0x4303edb91d23fc648bfeeb65349596bcf4df0742": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/deioxd.png"} />
  ),
  // StrategyOxdSolidexVolatileDeiDeusLp
  "0x817caff2dac62bdcce1ebe332ca128215dbd9e9a": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/deideus.png"} />
  ),
  // StrategyOxdSolidlyVolatileSexG3crvLp
  "0x966f6dfdfdc7fef3271287a88cb53c77d8901c19": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/sexg3crv.png"} />
  ),
  // StrategyOxdSolidlyVolatileWftmOxd2
  "0xcb6eab779780c7fd6d014ab90d8b10e97a1227e2": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/oxd.png"} />
  ),
  // STAR USDC
  "0x12edea9cd262006cc3c4e77c90d2cd2dd4b1eb97": (
    <LpIcon swapIconSrc={"/protocols/stargate.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),
  // StrategyOxdSolidlyVolatileDeiDeus
  "0xf42dbcf004a93ae6d5922282b304e2aefdd50058": (
    <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/deideus.png"} />
  ),
  // // StrategyOxdSolidlyVolatileUsdcWeveLp
  // "0xD9A4108CBB40a12dE16dFFDc54aE5065878816d7": (
  //   <LpIcon swapIconSrc={"/protocols/oxd.png"} tokenIconSrc={"/tokens/renbtc.png"} />
  // ),

  // Gnosis
  // StrategySushiLinkXdai
  "0xb320609f2bf3ca98754c14db717307c6d6794d8b": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/linkxdai.png"} />
  ),
  // StrategySushiXdaiGno
  "0x0f9d54d9ee044220a3925f9b97509811924fd269": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/gnoxdai.png"} />
  ),
  // StrategySushiSushiGno
  "0xf38c5b39f29600765849ca38712f302b1522c9b8": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/sushigno.png"} />
  ),
  // StrategySushiUsdcXdai
  "0xa227c72a4055a9dc949cae24f54535fe890d3663": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/usdcxdai.png"} />
  ),
  // StrategySushiUsdcUsdt
  "0x74c2efa722010ad7c142476f525a051084da2c42": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/usdcusdt.png"} />
  ),
  // StrategySushiXdaiUsdt
  "0x6685c047eab042297e659bfaa7423e94b4a14b9e": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/xdaiusdt.png"} />
  ),
  // StrategySushiWethGno
  "0x15f9eedeebd121fbb238a8a0cae38f4b4a07a585": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/wethgno.png"} />
  ),
  // StrategySushiWethWbtc
  "0xe21f631f47bfb2bc53ed134e83b8cff00e0ec054": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/wethwbtc.png"} />
  ),
  // StrategySushiWethXdai
  "0x8c0c36c85192204c8d782f763ff5a30f5ba0192f": (
    <LpIcon swapIconSrc={"/protocols/sushi.png"} tokenIconSrc={"/tokens/wethxdai.png"} />
  ),
  // StrategySwaprGnoXdai
  "0xd7b118271b1b7d26c9e044fc927ca31dccb22a5a": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/gnoxdai.png"} />
  ),
  // StrategySwaprWbtcWeth
  "0xf6be7ad58f4baa454666b0027839a01bcd721ac3": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/wethwbtc.png"} />
  ),
  // StrategySwaprCowWeth
  "0x8028457e452d7221db69b1e0563aa600a059fab1": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/cowweth.png"} />
  ),
  // StrategySwaprGnoWeth
  "0x5fca4cbdc182e40aefbcb91afbde7ad8d3dc18a8": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/wethgno.png"} />
  ),
  // StrategySwaprDxdGno
  "0x558d777b24366f011e35a9f59114d1b45110d67b": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/dxdgno.png"} />
  ),
  // StrategySwaprXdaiWeth
  "0x1865d5445010e0baf8be2eb410d3eae4a68683c2": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/wethxdai.png"} />
  ),
  // StrategySwaprCowGno
  "0xdbf14bce36f661b29f6c8318a1d8944650c73f38": (
    <LpIcon swapIconSrc={"/protocols/swapr.png"} tokenIconSrc={"/tokens/cowgno.png"} />
  ),
};

const USDC_SCALE = ethers.utils.parseUnits("1", 12);

const setButtonStatus = (
  status: ERC20TransferStatus,
  transfering: string,
  idle: string,
  setButtonText: (arg0: ButtonStatus) => void,
) => {
  // Deposit
  if (status === ERC20TransferStatus.Approving) {
    setButtonText({
      disabled: true,
      text: "Approving...",
    });
  }
  if (status === ERC20TransferStatus.Transfering) {
    setButtonText({
      disabled: true,
      text: transfering,
    });
  }
  if (
    status === ERC20TransferStatus.Success ||
    status === ERC20TransferStatus.Failed ||
    status === ERC20TransferStatus.Cancelled
  ) {
    setButtonText({
      disabled: false,
      text: idle,
    });
  }
};

export const JarCollapsible: FC<{
  jarData: UserJarData;
}> = ({ jarData }) => {
  const {
    name,
    jarContract,
    depositToken,
    ratio,
    depositTokenName,
    depositTokenDecimals,
    balance,
    deposited,
    usdPerPToken,
    APYs,
    totalAPY,
    depositTokenLink,
    tvlUSD,
    zapDetails,
  } = jarData;

  const { t } = useTranslation("common");
  const { pickleCore } = PickleCore.useContainer();
  const [ethBalance, setEthBalance] = useState(BigNumber.from(0));

  const isNative = isCroToken(depositToken.address);
  const jarTokenDetails: TokenDetails = {
    symbol: depositTokenName,
    balance: balance,
    decimals: depositTokenDecimals,
    address: depositToken.address,
  };

  const [inputToken, setInputToken] = useState<TokenDetails>(jarTokenDetails);
  const [allInputTokens, setAllInputTokens] = useState<Array<TokenDetails>>([jarTokenDetails]);

  let uncompounded = APYs?.map((x) => {
    const k: string = Object.keys(x)[0];
    const shouldNotUncompound = k === "pickle" || k === "lp";
    const v = shouldNotUncompound ? Object.values(x)[0] : uncompoundAPY(Object.values(x)[0]);
    const ret: JarApy = {};
    ret[k] = v;
    return ret;
  });

  const totalAPR: number = uncompounded
    ?.map((x) => {
      return Object.values(x).reduce((acc, y) => acc + y, 0);
    })
    .reduce((acc, x) => acc + x, 0);
  let difference = totalAPY - totalAPR;

  if (!uncompounded) {
    uncompounded = [{ lp: 0 }];
  }

  const tooltipText = [
    `${t("farms.baseAPRs")}:`,
    ...uncompounded?.map((x) => {
      const k = Object.keys(x)[0];
      const v = Object.values(x)[0];
      return v ? `${k}: ${v.toFixed(2)}%` : null;
    }),
    ,
    `${t(
      "farms.compounding",
    )} <img src="/magicwand.svg" height="16" width="16"/>: ${difference.toFixed(2)}%`,
  ]
    .filter((x) => x)
    .join(" <br/> ");

  const balNum = parseFloat(
    isNative ? formatEther(ethBalance) : formatUnits(balance, depositTokenDecimals),
  );
  const depositedNum = parseFloat(formatUnits(deposited, depositTokenDecimals));
  const balStr = balNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balNum < 1 ? 8 : 4,
  });
  const depositedStr = depositedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 8 : 4,
  });
  const depositedUnderlyingStr = (depositedNum * ratio).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 8 : 4,
  });
  const valueStr = (usdPerPToken * depositedNum).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.deposit"),
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.withdraw"),
  });

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, address, blockNum } = Connection.useContainer();

  useEffect(() => {
    // Update tokens and balances
    let inputTokens = [jarTokenDetails];
    if (zapDetails) inputTokens = [...inputTokens, ...zapDetails.inputTokens];

    const updatedBalance =
      inputTokens.find((x) => x.symbol === inputToken.symbol)?.balance || BigNumber.from("0");
    setAllInputTokens(inputTokens);
    setInputToken({
      ...inputToken,
      balance: updatedBalance,
    });
  }, [zapDetails, erc20TransferStatuses]);

  useEffect(() => {
    const dStatus = getTransferStatus(
      inputToken.address,
      inputToken.symbol === depositTokenName || !zapDetails
        ? jarContract.address
        : zapDetails.pickleZapContract.address,
    );
    const wStatus = getTransferStatus(jarContract.address, jarContract.address);

    setButtonStatus(dStatus, t("farms.depositing"), t("farms.deposit"), setDepositButton);
    setButtonStatus(wStatus, t("farms.withdrawing"), t("farms.withdraw"), setWithdrawButton);
  }, [erc20TransferStatuses]);

  useEffect(() => {
    const setBalance = async () => setEthBalance(await signer.getBalance());
    setBalance();
  }, [address, blockNum]);

  const explanations: RatioAndPendingStrings = getRatioStringAndPendingString(
    usdPerPToken,
    depositedNum,
    0,
    ratio,
    jarContract.address.toLowerCase(),
    pickleCore,
    t,
  );
  const valueStrExplained = explanations.ratioString;
  const userSharePendingStr = explanations.pendingString;

  const getInputTokenBalStr = (inputToken: TokenDetails) => {
    const bal = parseFloat(formatUnits(inputToken.balance, inputToken.decimals));

    return bal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: bal < 1 ? 8 : 4,
    });
  };

  const getTokenBySymbol = (symbol: string) => {
    const found = allInputTokens.find((x) => x.symbol === symbol);
    if (!found) return jarTokenDetails;
    return found;
  };

  const deposit = async () => {
    if (!signer) return;

    const depositAmt = ethers.utils.parseUnits(depositAmount, inputToken.decimals);

    // Deposit token
    if (inputToken.symbol === depositTokenName) {
      return transfer({
        token: inputToken.address,
        recipient: jarContract.address,
        approvalAmountRequired: depositAmt,
        transferCallback: async () => {
          return isNative
            ? jarContract.connect(signer).deposit({ value: depositAmt })
            : jarContract.connect(signer).deposit(depositAmt);
        },
      });
    }

    if (!zapDetails) return;

    const swapTx = inputToken.isWrapped
      ? await zapDetails.router
          .connect(signer)
          .populateTransaction.swapExactTokensForTokens(
            depositAmt,
            0,
            zapDetails.nativePath.path,
            zapDetails.pickleZapContract.address,
            BigNumber.from(neverExpireEpochTime),
          )
      : await zapDetails.router
          .connect(signer)
          .populateTransaction.swapExactETHForTokens(
            0,
            zapDetails.nativePath.path,
            zapDetails.pickleZapContract.address,
            BigNumber.from(neverExpireEpochTime),
          );

    return transfer({
      token: inputToken.address,
      recipient: zapDetails.pickleZapContract.address,
      approval: !(inputToken.isNative === true),
      approvalAmountRequired: depositAmt,
      transferCallback: async () => {
        return zapDetails.pickleZapContract
          .connect(signer)
          .ZapIn(
            inputToken.address,
            depositAmt,
            depositToken.address,
            jarContract.address,
            0,
            zapDetails.nativePath.target,
            swapTx.data || ethers.constants.AddressZero,
            true,
            zapDetails.router.address,
            false,
            {
              value: inputToken.isNative === true ? depositAmt : BigNumber.from(0),
            },
          );
      },
    });
  };

  const multiFarmsDepositToken = Object.keys(JAR_DEPOSIT_TOKEN_MULTI_FARMS_TO_ICON).includes(
    depositToken.address.toLowerCase(),
  );
  let multiFarmsApiKey: string | undefined;
  if (multiFarmsDepositToken) multiFarmsApiKey = jarData.apiKey;

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={5} lg={6}>
            <TokenIcon
              src={
                multiFarmsApiKey
                  ? JAR_DEPOSIT_TOKEN_MULTI_FARMS_TO_ICON[
                      depositToken.address.toLowerCase() as keyof typeof JAR_DEPOSIT_TOKEN_MULTI_FARMS_TO_ICON
                    ][multiFarmsApiKey]
                  : JAR_DEPOSIT_TOKEN_TO_ICON[
                      depositToken.address.toLowerCase() as keyof typeof JAR_DEPOSIT_TOKEN_TO_ICON
                    ]
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{name}</div>
              <a href={depositTokenLink} target="_" style={{ fontSize: `1rem` }}>
                {depositTokenName}
              </a>
            </div>
          </JarName>
          <Grid xs={24} sm={8} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <Label>{t("balances.balance")}</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>{t("farms.deposited")}</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={3} css={{ textAlign: "center" }}>
            <Data isZero={usdPerPToken * depositedNum === 0}>${valueStr}</Data>
            <Label>{t("balances.depositValue")}</Label>
            {Boolean(valueStrExplained !== undefined) && <Label>{valueStrExplained}</Label>}
            {Boolean(userSharePendingStr !== undefined) && <Label>{userSharePendingStr}</Label>}
          </Grid>

          <Grid xs={24} sm={12} md={5} lg={4} css={{ textAlign: "center" }}>
            <Data>
              <Tooltip text={ReactHtmlParser(tooltipText)}>
                {getFormatString(totalAPY) + "%" || "--"}
              </Tooltip>
              <img src="/question.svg" width="15px" style={{ marginLeft: 5 }} />
              <div>
                <span>{t("balances.apy")}</span>
              </div>
            </Data>
          </Grid>
          <Grid xs={24} sm={12} md={4} lg={4} css={{ textAlign: "center" }}>
            <Data isZero={tvlUSD === 0}>${getFormatString(tvlUSD)}</Data>
            <Label>{t("balances.tvl")}</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={depositedNum ? 12 : 24}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}: {isNative ? balStr : getInputTokenBalStr(inputToken)}{" "}
              {inputToken.symbol}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(
                  isNative
                    ? formatEther(ethBalance)
                    : formatUnits(inputToken.balance, inputToken.decimals),
                );
              }}
            >
              {t("balances.max")}
            </Link>
          </div>
          {zapDetails && allInputTokens.length > 0 ? (
            <Grid.Container gap={3}>
              <Grid md={8}>
                <Select
                  size="medium"
                  width="100%"
                  value={inputToken.symbol}
                  onChange={(e) => {
                    setInputToken(getTokenBySymbol(e.toString()));
                    setDepositAmount("");
                  }}
                >
                  {allInputTokens.map((token) => (
                    <Select.Option
                      style={{ fontSize: "1rem" }}
                      value={token.symbol}
                      key={token.symbol}
                    >
                      <div style={{ display: `flex`, alignItems: `center` }}>{token.symbol}</div>
                    </Select.Option>
                  ))}
                </Select>
              </Grid>
              <Grid md={16}>
                <Input
                  onChange={(e) => setDepositAmount(e.target.value)}
                  value={depositAmount}
                  width="100%"
                ></Input>
              </Grid>
            </Grid.Container>
          ) : (
            <Input
              onChange={(e) => setDepositAmount(e.target.value)}
              value={depositAmount}
              width="100%"
            ></Input>
          )}
          <Spacer y={0.5} />
          <Button onClick={deposit} disabled={depositButton.disabled} style={{ width: "100%" }}>
            {depositButton.text}
          </Button>
        </Grid>
        {depositedNum !== 0 && (
          <Grid xs={24} md={12}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {t("balances.balance")} {depositedStr} (
                <Tooltip
                  text={`${deposited && ratio ? depositedNum * ratio : 0} ${depositTokenName}`}
                >
                  {depositedUnderlyingStr}
                </Tooltip>{" "}
                {depositTokenName}){" "}
              </div>
              <Link
                color
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setWithdrawAmount(formatUnits(deposited, depositTokenDecimals));
                }}
              >
                {t("balances.max")}
              </Link>
            </div>
            <Input
              onChange={(e) => setWithdrawAmount(e.target.value)}
              value={withdrawAmount}
              width="100%"
            ></Input>
            <Spacer y={0.5} />
            <Button
              disabled={withdrawButton.disabled}
              onClick={() => {
                if (signer) {
                  // Allow pToken to burn its pToken
                  // and refund lpToken
                  transfer({
                    token: jarContract.address,
                    recipient: jarContract.address,
                    transferCallback: async () => {
                      return jarContract
                        .connect(signer)
                        .withdraw(ethers.utils.parseUnits(withdrawAmount, depositTokenDecimals));
                    },
                    approval: false,
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {withdrawButton.text}
            </Button>
          </Grid>
        )}
      </Grid.Container>
    </Collapse>
  );
};

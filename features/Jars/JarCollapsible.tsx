import { ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";

import { Connection } from "../../containers/Connection";
import { formatEther } from "ethers/lib/utils";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { UserJarData } from "../../containers/UserJars";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { JAR_DEPOSIT_TOKENS } from "../../containers/Jars/jars";
import { NETWORK_NAMES } from "containers/config";

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

export const JAR_DEPOSIT_TOKEN_TO_ICON: {
  [key: string]: string | ReactNode;
} = {
  "0xC25a3A3b969415c80451098fa907EC722572917F": "/sCRV.png",
  "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11": "/dai.png",
  "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc": "/usdc.png",
  "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852": "/usdt.png",
  "0x49849C98ae39Fff122806C06791Fa73784FB3675": "/rencrv.png",
  "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490": "/3crv.png",
  "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940": "/btc.png",
  "0x6B175474E89094C44Da98b954EedeAC495271d0F": "/dai.png",
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0xd48cf4d7fb0824cc8bae055df3092584d0a1726a": "/saddle.svg",
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/btc.png"} />
  ),
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yfi.png"} />
  ),
  "0xd4405F0704621DBe9d4dEA60E128E0C3b26bddbD": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/bac.png"} />
  ),
  "0x3E78F2E7daDe07ea685F8612F00477FD97162F1e": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/bas.svg"} />
  ),
  "0x87dA823B6fC8EB8575a235A824690fda94674c88": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/mir.png"} />
  ),
  "0x9928e4046d7c6513326cCeA028cD3e7a91c7590A": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/fei.png"} />
  ),
  "0x5233349957586A8207c52693A959483F9aeAA50C": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tesla.png"} />
  ),
  "0xB022e08aDc8bA2dE6bA4fECb59C6D502f66e953B": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/apple.png"} />
  ),
  "0x9E3B47B861B451879d43BBA404c35bdFb99F0a6c": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/qqq.png"} />
  ),
  "0x860425bE6ad1345DC7a3e287faCBF32B18bc4fAe": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/slv.png"} />
  ),
  "0x676Ce85f66aDB8D7b8323AeEfe17087A3b8CB363": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/baba.png"} />
  ),
  "0xC9cB53B48A2f3A9e75982685644c1870F1405CCb": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mic.png"} />
  ),
  "0x066F3A3B7C8Fa077c71B9184d862ed0A4D5cF3e0": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mis.png"} />
  ),
  "0x06325440D014e39736583c165C2963BA99fAf14E": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/steth.png"} />
  ),
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yvecrv.png"} />
  ),
  "0x9461173740D27311b176476FA27e94C681b1Ea6b": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yvboost.png"} />
  ),
  "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/sushiswap.png"} />
  ),
  "0xF20EF17b889b437C151eB5bA15A47bFc62bfF469": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/lusd.webp"} />
  ),
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/alchemix.png"} />
  ),
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/lusd.webp"} />
  ),
  "0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/frax.webp"} />
  ),
  "0x05767d9EF41dC40689678fFca0608878fb3dE906": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/convex.png"} />
  ),
  "0x6DEA81C8171D0bA574754EF6F8b412F2Ed88c54D": "/liquity.png",
  "0x5a6A4D54456819380173272A5E8E9B9904BdF41B": (
    <LpIcon swapIconSrc={"/mim.webp"} tokenIconSrc={"/3crv.png"} />
  ),
  "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/spell.webp"} />
  ),
  "0x07D5695a24904CC1B6e3bd57cC7780B90618e3c4": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mim.webp"} />
  ),

  // Polygon Jars

  "0x1Edb2D8f791D2a51D56979bf3A25673D6E783232": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xb0b5e3bd18eb1e316bcd0bba876570b3c1779c55": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/pickle.png"} />
  ),
  "0x80676b414a905de269d0ac593322af821b683b92": (
    <LpIcon swapIconSrc={"/comethswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063": "/dai.png",
  "0xE7a24EF0C5e95Ffb0f6684b813A78F2a3AD7D171": "/3crv.png",
  "0xc2755915a85c6f6c1c0f3a86ac8c058f11caa9c9": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xc4e595acdd7d12fec385e5da5d43160e8a0bac0e": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/matic.png"} />
  ),
  "0x160532d2536175d65c03b97b0630a9802c274dad": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0x74dC9cdCa9a96Fd0B7900e6eb953d1EA8567c3Ce": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/mimatic.png"} />
  ),
  "0xb4d09ff3dA7f9e9A2BA029cb0A81A989fd7B8f17": (
    <LpIcon swapIconSrc={"/ironswap.png"} tokenIconSrc={"/3usd.png"} />
  ),
  "0x470e8de2eBaef52014A47Cb5E6aF86884947F08c": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/fox.png"} />
  ),
  "0x3324af8417844e70b81555A6D1568d78f4D4Bf1f": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/dino.jpeg"} />
  ),
  "0x9f03309A588e33A239Bf49ed8D68b2D45C7A1F11": (
    <LpIcon swapIconSrc={"/quickswap.png"} tokenIconSrc={"/dino.jpeg"} />
  ),
  "0xfCEAAf9792139BF714a694f868A215493461446D": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/truefi.jpeg"} />
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
  isYearnJar?: boolean;
}> = ({ jarData, isYearnJar = false }) => {
  const {
    name,
    jarContract,
    depositToken,
    ratio,
    depositTokenName,
    balance,
    deposited,
    usdPerPToken,
    APYs,
    totalAPY,
    depositTokenLink,
    apr,
  } = jarData;
  const isUsdc =
    depositToken.address.toLowerCase() ===
    JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].USDC.toLowerCase();

  const isMaiJar =
    depositToken.address.toLowerCase() ===
      JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].QUICK_MIMATIC_USDC.toLowerCase() ||
    depositToken.address.toLowerCase() ===
      JAR_DEPOSIT_TOKENS[NETWORK_NAMES.POLY].QUICK_MIMATIC_QI.toLowerCase();

  const isSaddleJar =
    depositToken.address.toLowerCase() ===
    JAR_DEPOSIT_TOKENS[NETWORK_NAMES.ETH].SADDLE_D4;

  const balNum = parseFloat(
    formatEther(isUsdc && balance ? balance.mul(USDC_SCALE) : balance),
  );
  const depositedNum = parseFloat(
    formatEther(isUsdc && deposited ? deposited.mul(USDC_SCALE) : deposited),
  );
  const balStr = balNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: balNum < 1 ? 8 : 4,
  });
  const depositedStr = depositedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: depositedNum < 1 ? 8 : 4,
  });
  const depositedUnderlyingStr = (
    parseFloat(
      formatEther(isUsdc && deposited ? deposited.mul(USDC_SCALE) : deposited),
    ) * ratio
  ).toLocaleString(undefined, {
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
    text: "Deposit",
  });
  const [withdrawButton, setWithdrawButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Withdraw",
  });

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { signer, chainName } = Connection.useContainer();

  useEffect(() => {
    const dStatus = getTransferStatus(
      depositToken.address,
      jarContract.address,
    );
    const wStatus = getTransferStatus(jarContract.address, jarContract.address);

    setButtonStatus(dStatus, "Depositing...", "Deposit", setDepositButton);
    setButtonStatus(wStatus, "Withdrawing...", "Withdraw", setWithdrawButton);
  }, [erc20TransferStatuses]);

  const tooltipText = APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return isNaN(v) ? null : `${k}: ${v.toFixed(2)}%`;
  })
    .filter((x) => x)
    .join(" + ");

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <JarName xs={24} sm={12} md={5} lg={5}>
            <TokenIcon
              src={
                JAR_DEPOSIT_TOKEN_TO_ICON[
                  depositToken.address as keyof typeof JAR_DEPOSIT_TOKEN_TO_ICON
                ]
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{name}</div>
              <a
                href={depositTokenLink}
                target="_"
                style={{ fontSize: `1rem` }}
              >
                {depositTokenName}
              </a>
            </div>
          </JarName>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <Data>
              <Tooltip text={tooltipText}>
                {totalAPY.toFixed(2) + "%" || "--"}
              </Tooltip>
            </Data>
            <Data>
              <Tooltip
                text={
                  isYearnJar
                    ? `This jar deposits into Yearn's ${
                        APYs[1]?.vault
                      }. The base rate of ${apr.toFixed(
                        2,
                      )}% is provided by the underlying Yearn strategy`
                    : `This yield is calculated in real time from a base rate of ${apr.toFixed(
                        2,
                      )}% which we auto-compound regularly.`
                }
              >
                <div style={{ display: "flex", marginTop: 5 }}>
                  <span>APY</span>
                  <img
                    src="./question.svg"
                    width="15px"
                    style={{ marginLeft: 5 }}
                  />
                </div>
              </Tooltip>
            </Data>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={5}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={4}>
            <Data isZero={depositedNum === 0}>{depositedStr}</Data>
            <Label>Deposited</Label>
          </Grid>
          <Grid xs={24} sm={8} md={4} lg={4}>
            <Data isZero={usdPerPToken * depositedNum === 0}>${valueStr}</Data>
            <Label>Value</Label>
          </Grid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Balance: {balStr}</div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setDepositAmount(
                  formatEther(
                    isUsdc && balance ? balance.mul(USDC_SCALE) : balance,
                  ),
                );
              }}
            >
              Max
            </Link>
          </div>
          <Input
            onChange={(e) => setDepositAmount(e.target.value)}
            value={depositAmount}
            width="100%"
          ></Input>
          <Spacer y={0.5} />
          <Button
            onClick={() => {
              if (signer) {
                // Allow Jar to get LP Token
                transfer({
                  token: depositToken.address,
                  recipient: jarContract.address,
                  transferCallback: async () => {
                    return jarContract
                      .connect(signer)
                      .deposit(
                        ethers.utils.parseUnits(depositAmount, isUsdc ? 6 : 18),
                      );
                  },
                });
              }
            }}
            disabled={depositButton.disabled}
            style={{ width: "100%" }}
          >
            {depositButton.text}
          </Button>
          {isMaiJar ? (
            <div
              style={{
                width: "100%",
                textAlign: "center",
                paddingTop: "4px",
                fontFamily: "Source Sans Pro",
              }}
            >
              A 0.5% fee is charged by Mai Finance upon depositing
            </div>
          ) : null}
        </Grid>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Balance {depositedStr} (
              <Tooltip
                text={`${
                  deposited && ratio
                    ? parseFloat(
                        formatEther(
                          isUsdc && deposited
                            ? deposited.mul(USDC_SCALE)
                            : deposited,
                        ),
                      ) * ratio
                    : 0
                } ${depositTokenName}`}
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
                setWithdrawAmount(
                  formatEther(isUsdc ? deposited.mul(USDC_SCALE) : deposited),
                );
              }}
            >
              Max
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
                      .withdraw(
                        ethers.utils.parseUnits(
                          withdrawAmount,
                          isUsdc ? 6 : 18,
                        ),
                      );
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
      </Grid.Container>
    </Collapse>
  );
};

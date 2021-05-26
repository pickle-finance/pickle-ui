import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import {
  Button,
  Link,
  Input,
  Grid,
  Spacer,
  Tooltip,
  Checkbox,
} from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";

import { JAR_FARM_MAP, PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { UserFarmData } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts-Ethereum";
import { Jars } from "../../containers/Jars";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { JarApy } from "../../containers/Jars-Ethereum/useJarsWithAPY";
import { useUniPairDayData } from "../../containers/Jars-Ethereum/useUniPairDayData";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { PICKLE_JARS } from "../../containers/Jars-Ethereum/jars";
import { useMigrate } from "./UseMigrate";

interface ButtonStatus {
  disabled: boolean;
  text: string;
}

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

export const FARM_LP_TO_ICON = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819": "/pickle.png",
  "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11": "/dai.png",
  "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc": "/usdc.png",
  "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852": "/usdt.png",
  "0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c": "/susd.png",
  "0xf79Ae82DCcb71ca3042485c85588a3E0C395D55b": "/punidai.png",
  "0x46206E9BDaf534d057be5EcF231DaD2A1479258B": "/puniusdc.png",
  "0x3a41AB1e362169974132dEa424Fb8079Fd0E94d8": "/puniusdt.png",
  "0x2385D31f1EB3736bE0C3629E6f03C4b3cd997Ffd": "/pscrv.png",
  "0xCffA068F1E44D98D3753966eBd58D4CFe3BB5162": "/dai-gold.png",
  "0x53Bf2E62fA20e2b4522f05de3597890Ec1b352C6": "/usdc-gold.png",
  "0x09FC573c502037B149ba87782ACC81cF093EC6ef": "/usdt-gold.png",
  "0x68d14d66B2B0d6E157c06Dc8Fefa3D8ba0e66a89": "/curve-gold.png",
  "0xc80090AA05374d336875907372EE4ee636CBC562": "/btc.png",
  "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33": "/3crv.png",
  "0x2E35392F4c36EBa7eCAFE4de34199b2373Af22ec": "/rencrv.png",
  "0x6949Bb624E8e8A90F87cD2058139fcd77D2F3F87": "/dai.png",
  "0xC1513C1b0B359Bc5aCF7b772100061217838768B": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/fei.png"} />
  ),
  "0x927e3bCBD329e89A8765B52950861482f0B227c4": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/lusd.webp"} />
  ),
  "0x3Bcd97dCA7b1CED292687c97702725F37af01CaC": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/mir-ust.png"} />
  ),
  "0xaFB2FE266c215B5aAe9c4a9DaDC325cC7a497230": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/tesla.png"} />
  ),
  "0xF303B35D5bCb4d9ED20fB122F5E268211dEc0EBd": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/apple.png"} />
  ),
  "0x7C8de3eE2244207A54b57f45286c9eE1465fee9f": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/qqq.png"} />
  ),
  "0x1ed1fD33b62bEa268e527A622108fe0eE0104C07": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/slv.png"} />
  ),
  "0x1CF137F651D8f0A4009deD168B442ea2E870323A": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/baba.png"} />
  ),
  "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yvecrv.png"} />
  ),
  "0xECb520217DccC712448338B0BB9b08Ce75AD61AE": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/sushiswap.png"} />
  ),
  "0x55282dA27a3a02ffe599f6D11314D239dAC89135": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/dai.png"} />
  ),
  "0x8c2D16B7F6D3F989eb4878EcF13D695A7d504E43": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0xa7a37aE5Cb163a3147DE83F15e15D8E5f94D6bCE": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/usdt.png"} />
  ),
  "0xde74b6c547bd574c3527316a2eE30cd8F6041525": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/btc.png"} />
  ),
  "0x3261D9408604CC8607b687980D40135aFA26FfED": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yfi.png"} />
  ),
  "0x2350fc7268F3f5a6cC31f26c38f706E41547505d": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/bac.png"} />
  ),
  "0x748712686a78737DA0b7643DF78Fdf2778dC5944": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/bas.svg"} />
  ),
  "0xC66583Dd4E25b3cfc8D881F6DbaD8288C7f5Fd30": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mic.png"} />
  ),
  "0x0FAA189afE8aE97dE1d2F01E471297678842146d": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mis.png"} />
  ),
  "0x77C8A58D940a322Aea02dBc8EE4A30350D4239AD": (
    <LpIcon swapIconSrc={"/curve.png"} tokenIconSrc={"/steth.png"} />
  ),
};

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

export const FarmCollapsible: FC<{ farmData: UserFarmData }> = ({
  farmData,
}) => {
  const { jars } = Jars.useContainer();

  const {
    poolName,
    poolIndex,
    depositToken,
    depositTokenName,
    balance,
    staked,
    harvestable,
    usdPerToken,
    apy,
  } = farmData;
  const stakedNum = parseFloat(formatEther(staked));
  const valueStr = (stakedNum * usdPerToken).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bal = parseFloat(formatEther(balance));
  const balStr = bal.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: bal < 1 ? 18 : 4,
  });
  const stakedStr = stakedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: stakedNum < 1 ? 18 : 4,
  });
  const harvestableStr = parseFloat(
    formatEther(harvestable || 0),
  ).toLocaleString();

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { signer, chainName } = Connection.useContainer();
  const { deposit, withdraw } = useMigrate(depositToken, poolIndex, staked);

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Stake",
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Unstake",
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Harvest",
  });

  const [migrateState, setMigrateState] = useState<string | null>(null);

  // Get Jar APY (if its from a Jar)
  let APYs: JarApy[] = [{ pickle: apy * 100 }];

  const maybeJar =
    JAR_FARM_MAP[depositToken.address as keyof typeof JAR_FARM_MAP];
  if (jars && maybeJar) {
    const farmingJar = jars.filter((x) => x.jarName === maybeJar.jarName)[0];
    APYs = farmingJar?.APYs ? [...APYs, ...farmingJar.APYs] : APYs;
  }

  const { getUniPairDayAPY } = useUniPairDayData();
  if (depositToken.address.toLowerCase() === PICKLE_ETH_FARM.toLowerCase()) {
    APYs = [...APYs, ...getUniPairDayAPY(PICKLE_ETH_FARM)];
  }

  const tooltipText = APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return `${k}: ${v.toFixed(2)}%`;
  }).join(" + ");

  const totalAPY = APYs.map((x) => {
    return Object.values(x).reduce((acc, y) => acc + y, 0);
  }).reduce((acc, x) => acc + x, 0);

  const isDisabledFarm =
    depositToken.address === PICKLE_JARS.pUNIBACDAI ||
    depositToken.address === PICKLE_JARS.pUNIBASDAI;

  const handleMigrate = async () => {
    if (stakedNum) {
      try {
        setMigrateState("Withdrawing...");
        await withdraw();
        setMigrateState("Migrating...");
        await deposit();
        setMigrateState("Migration successful!");
      } catch (error) {
        console.error(error);
        alert(error.message);
        setMigrateState(null);
        return;
      }
    }
  };

  useEffect(() => {
    if (masterchef) {
      const stakeStatus = getTransferStatus(
        depositToken.address,
        masterchef.address,
      );
      const unstakeStatus = getTransferStatus(
        masterchef.address,
        depositToken.address,
      );
      const harvestStatus = getTransferStatus(
        masterchef.address,
        poolIndex.toString(),
      );

      setButtonStatus(stakeStatus, "Staking...", "Stake", setStakeButton);
      setButtonStatus(
        unstakeStatus,
        "Unstaking...",
        "Unstake",
        setUnstakeButton,
      );
      setButtonStatus(
        harvestStatus,
        "Harvesting...",
        "Harvest",
        setHarvestButton,
      );
    }
  }, [erc20TransferStatuses]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <TokenIcon
              src={
                FARM_LP_TO_ICON[
                  depositToken.address as keyof typeof FARM_LP_TO_ICON
                ]
              }
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{poolName}</div>
              <Label style={{ fontSize: `0.85rem` }}>{depositTokenName}</Label>
            </div>
          </Grid>
          <Grid xs={24} sm={12} md={3} lg={3}>
            <Tooltip text={apy === 0 ? "--" : tooltipText}>
              <div>{apy === 0 ? "--%" : totalAPY.toFixed(2) + "%"}</div>
              <Label>Total APY</Label>
            </Tooltip>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>
              {harvestableStr}
            </Data>
            <Label>Earned</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={bal === 0}>{balStr}</Data>
            <Label>Balance</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={stakedNum === 0}>{stakedStr}</Data>
            <Label>Staked</Label>
          </Grid>
          <Grid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={stakedNum * usdPerToken === 0}>${valueStr}</Data>
            <Label>Value Staked</Label>
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
                setStakeAmount(formatEther(balance));
              }}
            >
              Max
            </Link>
          </div>
          <Input
            onChange={(e) => setStakeAmount(e.target.value)}
            value={stakeAmount}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <Button
            disabled={stakeButton.disabled || isDisabledFarm}
            onClick={() => {
              if (masterchef && signer) {
                transfer({
                  token: depositToken.address,
                  recipient: masterchef.address,
                  transferCallback: async () => {
                    return masterchef
                      .connect(signer)
                      .deposit(poolIndex, ethers.utils.parseEther(stakeAmount));
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {stakeButton.text}
          </Button>
        </Grid>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>Staked: {stakedStr}</div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setUnstakeAmount(formatEther(staked));
              }}
            >
              Max
            </Link>
          </div>
          <Input
            onChange={(e) => setUnstakeAmount(e.target.value)}
            value={unstakeAmount}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <Button
            disabled={unstakeButton.disabled || isDisabledFarm}
            onClick={() => {
              if (masterchef && signer) {
                transfer({
                  token: masterchef.address,
                  recipient: depositToken.address,
                  approval: false,
                  transferCallback: async () => {
                    return masterchef
                      .connect(signer)
                      .withdraw(
                        poolIndex,
                        ethers.utils.parseEther(unstakeAmount),
                      );
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {unstakeButton.text}
          </Button>
        </Grid>
      </Grid.Container>
      <Spacer />
      <Button
        disabled={migrateState !== null || isDisabledFarm}
        onClick={handleMigrate}
        style={{ width: "100%" }}
      >
        {migrateState || "Migrate"}
      </Button>
      <div
        style={{
          width: "100%",
          textAlign: "center",
          fontFamily: "Source Sans Pro",
          fontSize: "0.8rem",
        }}
      >
        Your tokens will be unstaked and deposited in the new Farms. This
        process requires a number of transactions.
      </div>
    </Collapse>
  );
};

import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { formatEther, formatUnits } from "ethers/lib/utils";

import { useJarFarmMap, PICKLE_ETH_FARM } from "../../containers/Farms/farms";
import { UserFarmData } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";
import { Jars } from "../../containers/Jars";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { JarApy } from "../../containers/Jars/useJarsWithAPYPFCore";
import { useUniPairDayData } from "../../containers/Jars/useUniPairDayData";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import { useMigrate } from "./UseMigrate";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { isYveCrvEthJarToken } from "v1/containers/Jars/jars";

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
  "0xCeD67a187b923F0E5ebcc77C7f2F7da20099e378": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/yvboost.png"} />
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
  "0x77C8A58D940a322Aea02dBc8EE4A30350D4239AD": (
    <LpIcon swapIconSrc={"/convex.png"} tokenIconSrc={"/steth.png"} />
  ),
  "0x9eb0aAd5Bb943D3b2F7603Deb772faa35f60aDF9": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/alchemix.png"} />
  ),
  "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/usdc.png"} />
  ),
  "0x4fFe73Cf2EEf5E8C8E0E10160bCe440a029166D2": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/lusd.webp"} />
  ),
  "0x729C6248f9B1Ce62B3d5e31D4eE7EE95cAB32dfD": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc={"/frax.webp"} />
  ),
  "0x4E9806345fb39FFebd70A01f177A675805019ba8": (
    <LpIcon swapIconSrc={"/yfi.png"} tokenIconSrc="/cream.jpeg" />
  ),
  "0xDCfAE44244B3fABb5b351b01Dc9f050E589cF24F": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/convex.png"} />
  ),
  "0x65B2532474f717D5A8ba38078B78106D56118bbb": "/liquity.png",
  "0xe6487033F5C8e2b4726AF54CA1449FEC18Bd1484": "/saddle.svg",
  "0x1Bf62aCb8603Ef7F3A0DFAF79b25202fe1FAEE06": (
    <LpIcon swapIconSrc={"/mim.webp"} tokenIconSrc={"/3crv.png"} />
  ),
  "0xdB84a6A48881545E8595218b7a2A3c9bd28498aE": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/spell.webp"} />
  ),
  "0x993f35FaF4AEA39e1dfF28f45098429E0c87126C": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/mim.webp"} />
  ),
  "0xeb8174F94FDAcCB099422d9A816B8E17d5e393E3": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/fox.png"} />
  ),
  "0x1d92e1702D7054f74eAC3a9569AeB87FC93e101D": (
    <LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/truefi.jpeg"} />
  ),
  "0x0989a227E7c50311f7De61e5e61F7c28Df8936f0": (
    <LpIcon swapIconSrc={"/uniswap.png"} tokenIconSrc={"/rally.jpeg"} />
  ),
  // STAR USDC
  "0x81740AAc02ae2F3c61D5a0c012b3e18f9dc02b5c": (
    <LpIcon swapIconSrc={"/protocols/stargate.png"} tokenIconSrc={"/tokens/usdc.png"} />
  ),
  // STAR USDT
  "0x363e7CD14AEcf4f7d0e66Ae1DEff830343D760a7": (
    <LpIcon swapIconSrc={"/protocols/stargate.png"} tokenIconSrc={"/tokens/usdt.png"} />
  ),
};

export const FarmCollapsible: FC<{ farmData: UserFarmData }> = ({ farmData }) => {
  const { jars } = Jars.useContainer();
  const jarFarmMap = useJarFarmMap();

  const {
    poolName,
    poolIndex,
    depositToken,
    depositTokenName,
    depositTokenDecimals,
    balance,
    staked,
    harvestable,
    usdPerToken,
    apy,
  } = farmData;
  const stakedNum = parseFloat(formatUnits(staked, depositTokenDecimals));
  const balanceNum = parseFloat(formatUnits(balance, depositTokenDecimals));
  const valueStr = (stakedNum * usdPerToken).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const bal = parseFloat(formatUnits(balance, depositTokenDecimals));
  const balStr = bal.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: bal < 1 ? 8 : 4,
  });
  const stakedStr = stakedNum.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: stakedNum < 1 ? 8 : 4,
  });
  const harvestableStr = parseFloat(formatEther(harvestable || 0)).toLocaleString();

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { masterchef } = Contracts.useContainer();
  const { signer, chainName } = Connection.useContainer();
  const { deposit, withdraw, migrateYvboost, depositYvboost } = useMigrate(
    depositToken,
    poolIndex,
    balance,
    staked,
  );

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
  const [yvMigrateState, setYvMigrateState] = useState<string | null>(null);
  const [isSuccess, setSuccess] = useState<boolean>(false);
  const { setButtonStatus } = useButtonStatus();
  const { pickleCore } = PickleCore.useContainer();

  // Get Jar APY (if its from a Jar)
  let APYs: JarApy[] = [{ pickle: apy * 100 }];

  const maybeJar = jarFarmMap[depositToken.address];
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

  const isyveCRVFarm = isYveCrvEthJarToken(depositToken.address);

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

  const handleYvboostMigrate = async () => {
    if (stakedNum || balanceNum) {
      try {
        setYvMigrateState("Withdrawing from Farm...");
        await withdraw();
        setYvMigrateState("Migrating to yvBOOST pJar...");
        await migrateYvboost();
        setYvMigrateState("Migrated! Staking in Farm...");
        await depositYvboost();
        setYvMigrateState(null);
        setSuccess(true);
      } catch (error) {
        console.error(error);
        alert(error.message);
        setYvMigrateState(null);
        return;
      }
    }
  };

  const renderButton = () => {
    // yvBOOST migration
    if (isyveCRVFarm) {
      return (
        <>
          <Button
            disabled={yvMigrateState !== null}
            onClick={handleYvboostMigrate}
            style={{ width: "100%", textTransform: "none" }}
          >
            {yvMigrateState || "Migrate yveCRV-ETH LP to yvBOOST-ETH LP"}
          </Button>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontFamily: "Source Sans Pro",
              fontSize: "1rem",
            }}
          >
            Your tokens will be unstaked and migrated to the yvBOOST pJar and staked in the new{" "}
            <Link color href="/farms">
              Farms
            </Link>
            . <br />
            This process will require a number of transactions.
            <br />
            Learn more about yvBOOST{" "}
            <a target="_" href="https://twitter.com/iearnfinance/status/1376912409688956932">
              here
            </a>
            .
            {isSuccess ? (
              <p style={{ fontWeight: "bold" }}>
                Migration completed! See your deposits{" "}
                <Link color href="/farms">
                  here
                </Link>
              </p>
            ) : null}
          </div>
        </>
      );
    }
    // Migration to Gauges for Mainnet
    else {
      return (
        <>
          <Button
            disabled={migrateState !== null}
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
              fontSize: "1rem",
            }}
          >
            Your tokens will be unstaked and deposited in the new Farms. This process requires a
            number of transactions.
          </div>
        </>
      );
    }
  };

  useEffect(() => {
    if (masterchef) {
      const stakeStatus = getTransferStatus(depositToken.address, masterchef.address);
      const unstakeStatus = getTransferStatus(masterchef.address, depositToken.address);
      const harvestStatus = getTransferStatus(masterchef.address, poolIndex.toString());

      setButtonStatus(stakeStatus, "Staking...", "Stake", setStakeButton);
      setButtonStatus(unstakeStatus, "Unstaking...", "Unstake", setUnstakeButton);
      setButtonStatus(harvestStatus, "Harvesting...", "Harvest", setHarvestButton);
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
              src={FARM_LP_TO_ICON[depositToken.address as keyof typeof FARM_LP_TO_ICON]}
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
            <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>{harvestableStr}</Data>
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
            disabled={stakeButton.disabled}
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
            disabled={unstakeButton.disabled}
            onClick={() => {
              if (masterchef && signer) {
                transfer({
                  token: masterchef.address,
                  recipient: depositToken.address,
                  approval: false,
                  transferCallback: async () => {
                    return masterchef
                      .connect(signer)
                      .withdraw(poolIndex, ethers.utils.parseEther(unstakeAmount));
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
      {renderButton()}
    </Collapse>
  );
};

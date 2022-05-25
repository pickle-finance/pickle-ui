import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Link, Input, Grid, Spacer, Tooltip } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";
import { useTranslation } from "next-i18next";

import { Connection } from "../../containers/Connection";
import { Contracts, PICKLE_ETH_SLP } from "../../containers/Contracts";
import { JarApy } from "../../containers/Jars/useJarsWithAPYPFCore";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import Collapse from "../Collapsible/Collapse";
import { LpIcon, TokenIcon, MiniIcon } from "../../components/TokenIcon";
import { useMC2 } from "../../containers/Gauges/useMC2";
import { getFormatString } from "../Gauges/GaugeInfo";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";
import { PickleCore } from "v1/containers/Jars/usePickleCore";
import { AssetProjectedApr, PickleAsset } from "picklefinance-core/lib/model/PickleModelJson";

const PICKLE_PID = 3;

interface DataProps {
  isZero?: boolean;
}

const CenteredGrid = styled(Grid)({
  textAlign: "center",
});

const Data = styled.div<DataProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => (props.isZero ? "#444" : "unset")};
`;

const Label = styled.div`
  font-family: "Source Sans Pro";
`;

const formatString = (num: number) =>
  num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 5 : 2,
  });

export const MC2Farm: FC = () => {
  const { slpStaked, slpBalance, userValue, apy, pendingPickle, pendingSushi, tvl } = useMC2();
  const { pickleCore } = PickleCore.useContainer();

  const balNum = parseFloat(formatEther(slpBalance));
  const balStr = formatString(balNum);
  const depositedNum = parseFloat(formatEther(slpStaked));
  const depositedStr = formatString(depositedNum);
  const valueStr = formatString(userValue);
  const pendingPickleNum = +formatEther(pendingPickle);
  const pendingPickleStr = formatString(pendingPickleNum);
  const pendingSushiNum = +formatEther(pendingSushi);
  const pendingSushiStr = formatString(pendingSushiNum);

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { masterchefV2 } = Contracts.useContainer();
  const { signer, address } = Connection.useContainer();
  const { t } = useTranslation("common");
  const { setButtonStatus } = useButtonStatus();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.stake"),
  });
  const [unstakeButton, setUnstakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.unstake"),
  });
  const [harvestButton, setHarvestButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("farms.harvest"),
  });

  let APYs = [];
  let totalAPY = 0;
  const pickleEthSlp: PickleAsset | undefined = pickleCore?.assets.external.find(
    (x) => x.depositToken.addr.toLowerCase() === PICKLE_ETH_SLP.toLowerCase(),
  );
  if (
    pickleEthSlp !== undefined &&
    pickleEthSlp.aprStats !== undefined &&
    pickleEthSlp.aprStats.components !== undefined
  ) {
    const aprStats: AssetProjectedApr = pickleEthSlp.aprStats;
    totalAPY = aprStats.apy;
    // hard code it to save time
    const sushiYield = aprStats.components.find((x) => x.name === "sushi");
    const lpYield = aprStats.components.find((x) => x.name === "lp");
    APYs.push({ sushi: sushiYield ? sushiYield.apr : 0 });
    APYs.push({ lp: lpYield ? lpYield.apr : 0 });
  }
  const tooltipText = APYs.map((x) => {
    const k = Object.keys(x)[0];
    const v = Object.values(x)[0];
    return `${k}: ${v.toFixed(2)}%`;
  }).join(" + ");

  useEffect(() => {
    if (masterchefV2) {
      const stakeStatus = getTransferStatus(PICKLE_ETH_SLP, masterchefV2.address);
      const unstakeStatus = getTransferStatus(masterchefV2.address, PICKLE_ETH_SLP);
      const harvestStatus = getTransferStatus(masterchefV2.address, PICKLE_PID.toString());

      setButtonStatus(stakeStatus, t("farms.staking"), t("farms.stake"), setStakeButton);
      setButtonStatus(unstakeStatus, t("farms.unstaking"), t("farms.unstake"), setUnstakeButton);
      setButtonStatus(harvestStatus, t("farms.harvesting"), t("farms.harvest"), setHarvestButton);
    }
  }, [erc20TransferStatuses]);

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none" }}
      shadow
      preview={
        <Grid.Container gap={1}>
          <CenteredGrid xs={24} sm={12} md={6} lg={6}>
            <TokenIcon
              src={<LpIcon swapIconSrc={"/sushiswap.png"} tokenIconSrc={"/pickle.png"} />}
            />
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: `1rem` }}>{t("farms.mc2")}</div>
              <Label style={{ fontSize: `1rem` }}>
                <a
                  href="https://app.sushi.com/add/ETH/0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5"
                  target="_"
                >
                  {t("farms.pickleEthSlp")}
                </a>
              </Label>
            </div>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={6} md={3} lg={3}>
            <Data isZero={balNum === 0}>{balStr}</Data>
            <br />
            <Label>{t("balances.walletBalance")}</Label>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={6} md={3} lg={3}>
            <Data isZero={pendingPickleNum === 0}>
              {pendingPickleStr} <MiniIcon source={"/pickle.png"} />
              <br />
              {pendingSushiStr} <MiniIcon source={"/sushiswap.png"} />
            </Data>
            <Label>{t("balances.earned")}</Label>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={userValue === 0}>${valueStr}</Data>
            <br />
            <Label>{t("balances.depositValue")}</Label>
          </CenteredGrid>
          <CenteredGrid xs={24} sm={12} md={4} lg={4}>
            <Tooltip text={typeof apy === "undefined" ? "--" : tooltipText}>
              <div>{typeof apy === "undefined" ? "--%" : totalAPY.toFixed(2) + "%"}</div>
              <br />
              <Label>{t("balances.totalApy")}</Label>
            </Tooltip>
          </CenteredGrid>

          <CenteredGrid xs={24} sm={6} md={4} lg={4}>
            <Data isZero={tvl === 0}>${getFormatString(tvl)}</Data>
            <br />
            <Label>{t("balances.tvl")}</Label>
          </CenteredGrid>
        </Grid.Container>
      }
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {t("balances.balance")}: {balStr}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setStakeAmount(formatEther(slpBalance));
              }}
            >
              {t("balances.max")}
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
              if (masterchefV2 && signer && address) {
                transfer({
                  token: PICKLE_ETH_SLP,
                  recipient: masterchefV2.address,
                  approvalAmountRequired: ethers.utils.parseEther(stakeAmount),
                  transferCallback: async () => {
                    return masterchefV2
                      .connect(signer)
                      .deposit(PICKLE_PID, ethers.utils.parseEther(stakeAmount), address);
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
            <div>
              {t("balances.staked")}: {depositedStr}
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setUnstakeAmount(formatEther(slpStaked));
              }}
            >
              {t("balances.max")}
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
              if (masterchefV2 && signer && address) {
                transfer({
                  token: masterchefV2.address,
                  recipient: PICKLE_ETH_SLP,
                  approval: false,
                  transferCallback: async () => {
                    return masterchefV2
                      .connect(signer)
                      .withdrawAndHarvest(
                        PICKLE_PID,
                        ethers.utils.parseEther(unstakeAmount),
                        address,
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
        <Spacer />
        <Grid xs={24}>
          <Spacer />
          <Button
            disabled={harvestButton.disabled}
            onClick={() => {
              if (masterchefV2 && signer && address) {
                transfer({
                  token: masterchefV2.address,
                  recipient: masterchefV2.address,
                  approval: false,
                  transferCallback: async () => {
                    return masterchefV2.connect(signer).harvest(PICKLE_PID, address);
                  },
                });
              }
            }}
            style={{ width: "100%" }}
          >
            {harvestButton.text}
          </Button>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontFamily: "Source Sans Pro",
              fontSize: "0.8rem",
            }}
          >
            {t("farms.mc2detail")}
          </div>
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};

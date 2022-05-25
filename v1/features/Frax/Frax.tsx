import { FC, useEffect, useState } from "react";
import { Button, Link, Input, Grid, Spacer, Card, Tooltip } from "@geist-ui/react";
import ReactHtmlParser from "react-html-parser";
import { useTranslation } from "next-i18next";
import { formatEther, parseEther } from "ethers/lib/utils";
import { formatPercent } from "../../util/number";
import { ButtonStatus, useButtonStatus } from "v1/hooks/useButtonStatus";
import { Connection } from "v1/containers/Connection";
import { useFrax } from "v1/containers/Frax/UseFrax";
import { ERC20Transfer } from "v1/containers/Erc20Transfer";
import { FraxAddresses } from "v1/containers/config";
import { Contracts } from "v1/containers/Contracts";
import styled from "styled-components";

const formatNumber = (num: number) => {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: num < 1 ? 6 : 4,
  });
};

export const FraxFeature: FC = () => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { vefxsVault } = Contracts.useContainer();
  const { t } = useTranslation("common");

  const {
    status: erc20TransferStatuses,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { setButtonStatus } = useButtonStatus();

  const {
    fxsBalance,
    fxsApr,
    userLockedFxs,
    userPendingFxs,
    pickleLockedFxs,
    tvl,
    flywheelApr,
  } = useFrax();

  const [depositAmount, setDepositAmount] = useState("");
  const [depositButton, setDepositButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Stake",
  });
  const [claimButton, setClaimButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Claim Rewards",
  });

  useEffect(() => {
    const dStatus = getTransferStatus(FraxAddresses.FXS, FraxAddresses.veFXSVault);
    const claimStatus = getTransferStatus(FraxAddresses.veFXSVault, "claim");

    setButtonStatus(dStatus, t("farms.depositing"), t("farms.deposit"), setDepositButton);

    setButtonStatus(claimStatus, t("dill.claiming"), t("dill.claim"), setClaimButton);
  }, [erc20TransferStatuses, fxsBalance]);

  const tooltipText = ` ${t("frax.aprBreakdown")}<br/><br/>${t(
    "frax.fxsDistribution",
  )}: ${formatPercent(fxsApr)}<br/>${t("frax.flywheelProfits")}: ${formatPercent(
    flywheelApr,
  )}<br/>ㅤ`;

  return (
    <>
      <Card>
        <h2>{t("frax.lockFxs")}</h2>
        <Grid.Container gap={2}>
          <Grid md={24}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                {t("balances.balance")}: {formatEther(fxsBalance)} FXS
              </div>
              <Link
                color
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setDepositAmount(formatEther(fxsBalance));
                }}
              >
                {t("balances.max")}
              </Link>
            </div>
            <Spacer y={0.5} />
            <Input
              onChange={(e) => setDepositAmount(e.target.value)}
              value={depositAmount}
              width="100%"
              type="number"
              size="large"
            />
            <Spacer y={0.5} />
            <Button
              disabled={depositButton.disabled}
              onClick={() => {
                if (signer && vefxsVault) {
                  transfer({
                    token: FraxAddresses.FXS,
                    recipient: FraxAddresses.veFXSVault,
                    transferCallback: async () => {
                      return vefxsVault.connect(signer).deposit(parseEther(depositAmount), {
                        gasLimit: 900000,
                      });
                    },
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {depositButton.text}
            </Button>
            <Spacer />
            <StyledNotice>{t("frax.deposit")}</StyledNotice>
          </Grid>
          <Spacer />
          <Grid xs={24}>
            <div>
              {t("frax.userLocked")}: {formatNumber(userLockedFxs)}
            </div>
            <Spacer />
            <Button
              disabled={claimButton.disabled || !userPendingFxs}
              onClick={() => {
                if (signer && vefxsVault) {
                  transfer({
                    token: FraxAddresses.FXS,
                    recipient: FraxAddresses.veFXSVault,
                    transferCallback: async () => {
                      return vefxsVault.connect(signer).claim({
                        gasLimit: 650000,
                      });
                    },
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {claimButton.text} {Boolean(userPendingFxs) && `${formatNumber(userPendingFxs)} FXS`}
            </Button>
            <Spacer y={1} />
          </Grid>

          <Grid xs={24} sm={24} md={24}>
            <Card>
              <h2>{t("frax.info")}</h2>
              <div>
                {t("frax.apy")}:{" "}
                <Tooltip
                  text={flywheelApr + fxsApr === 0 ? "--" : ReactHtmlParser(tooltipText)}
                  style={{ marginTop: 5 }}
                >
                  <div style={{ display: "flex" }}>{formatPercent(flywheelApr + fxsApr)}</div>
                </Tooltip>
              </div>
              &nbsp;
              <div>
                {t("frax.locked")}: {formatNumber(pickleLockedFxs)} FXS
              </div>
              &nbsp;
              <div>
                {t("frax.tvl")}: ${formatNumber(tvl)}
              </div>
            </Card>
          </Grid>
        </Grid.Container>
      </Card>
    </>
  );
};

const StyledNotice = styled.div`
  width: "100%";
  textalign: "center";
  paddingtop: "6px";
  fontfamily: "Source Sans Pro";
`;

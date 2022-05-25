import { useState, FC, useEffect } from "react";
import { Spacer, Grid, Card, Button } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";
import { useTranslation } from "next-i18next";

import { Contracts } from "../../containers/Contracts";
import { Connection } from "../../containers/Connection";
import { UseDillOutput } from "../../containers/Dill";
import { ERC20Transfer } from "../../containers/Erc20Transfer";
import { formatPercent } from "../../util/number";
import PickleIcon from "../../components/PickleIcon";
import { useButtonStatus, ButtonStatus } from "v1/hooks/useButtonStatus";

const formatNumber = (num: number, precision?: number) =>
  num &&
  (num.toLocaleString(undefined, {
    minimumFractionDigits: precision || 2,
    maximumFractionDigits: precision || 2,
  }) ||
    0);

export const Claim: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { blockNum, address, signer } = Connection.useContainer();
  const { feeDistributor } = Contracts.useContainer();
  const [claimable, setClaimable] = useState<number | null>(null);
  const { setButtonStatus } = useButtonStatus();
  const { t } = useTranslation("common");

  const [claimButton, setClaimButton] = useState<ButtonStatus>({
    disabled: claimable ? false : true,
    text: t("dill.claimPickles", {
      amount: claimable ? formatNumber(claimable, 3) : 0,
    }),
  });
  const { status: transferStatus, transfer, getTransferStatus } = ERC20Transfer.useContainer();

  const dillAPY =
    dillStats.weeklyDistribution && dillStats.lockedValue
      ? (dillStats.weeklyDistribution / dillStats.lockedValue) * 52
      : 0;

  useEffect(() => {
    if (address && feeDistributor) {
      const claimStatus = getTransferStatus("claim", feeDistributor.address);
      const claimable = dillStats.userClaimable
        ? parseFloat(formatEther(dillStats.userClaimable))
        : null;

      if (claimable) {
        setClaimButton({
          disabled: false,
          text: t("dill.claimPickles", {
            amount: claimable ? formatNumber(claimable, 3) : 0,
          }),
        });
        setButtonStatus(
          claimStatus,
          t("dill.claiming"),
          t("dill.claimPickles", {
            amount: claimable ? formatNumber(claimable, 3) : 0,
          }),
          setClaimButton,
        );
      } else {
        setClaimButton({
          disabled: true,
          text: t("dill.claimPickles", {
            amount: 0,
          }),
        });
      }
      setClaimable(claimable);
    }
  }, [blockNum, transferStatus, address, dillStats]);
  return (
    <>
      <Grid.Container gap={2}>
        <Grid xs={24} sm={24} md={24}>
          <Card>
            <h2>{t("dill.claim")}</h2>
            <div>
              {t("dill.weeklyRevenue")}: ${formatNumber(dillStats?.weeklyProfit || 0)}
            </div>
            &nbsp;
            <div>
              {t("dill.projected")}: ${formatNumber(dillStats?.weeklyDistribution || 0)}
            </div>
            &nbsp;
            <div>
              {t("dill.apy")}: {formatPercent(dillAPY)}
            </div>
            &nbsp;
            <div>
              {t("dill.nextDistribution")}: {dillStats.nextDistribution?.toDateString()}
            </div>
            &nbsp;
            <div>
              {t("dill.lastDistribution")}: ${formatNumber(dillStats?.lastDistributionValue || 0)} (
              {formatNumber(dillStats?.lastDistribution || 0)} <PickleIcon size={16} />)
            </div>
            &nbsp;
            <Spacer />
            <Button
              disabled={claimButton.disabled}
              onClick={() => {
                if (signer && address && feeDistributor) {
                  transfer({
                    token: "claim",
                    recipient: feeDistributor.address,
                    transferCallback: async () => {
                      const tx = await feeDistributor.connect(signer)["claim()"]();
                      tx.wait(0).then(() =>
                        setClaimButton({
                          disabled: true,
                          text: t("dill.claimPickles", {
                            amount: 0,
                          }),
                        }),
                      );
                      return tx;
                    },
                    approval: false,
                  });
                }
              }}
              style={{ width: "100%" }}
            >
              {claimButton.text}
            </Button>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
};

import { FC } from "react";
import { Card, Tooltip } from "@geist-ui/react";
import styled from "styled-components";
import { formatEther } from "ethers/lib/utils";
import { useTranslation } from "next-i18next";

import { UseDillOutput } from "../../containers/Dill";
import { formatDate } from "../../util/date";
import { formatPercent } from "../../util/number";
import PickleIcon from "../../components/PickleIcon";

const DataPoint = styled.div`
  font-size: 22px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const formatNumber = (value: number, min = 0, max = 2) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: min,
    maximumFractionDigits: max,
  });

interface Props {
  pickleBalance: number | null;
  dillStats: UseDillOutput;
}

export const DillStats: FC<Props> = ({ pickleBalance, dillStats }) => {
  const { totalSupply: dillSupply, lockEndDate, lockedAmount, balance: dillBalance } = dillStats;
  const { t } = useTranslation("common");

  const unlockTime = new Date();
  unlockTime.setTime(+(lockEndDate?.toString() || 0) * 1000);
  const isLocked = Boolean(+(lockEndDate?.toString() || 0));
  const isExpired = unlockTime < new Date();

  const isFetchingData = pickleBalance === null || !dillBalance;

  const lockedAmountValue = Number(formatEther(lockedAmount?.toString() || "0"));
  const dillBalanceValue = Number(formatEther(dillBalance?.toString() || "0"));
  const ratio = dillSupply ? dillBalanceValue / parseFloat(formatEther(dillSupply)) : 0;

  return (
    <Card>
      <h2>
        {isLocked ? (
          isExpired ? (
            <>{t("dill.expiredSince", { date: formatDate(unlockTime) })}</>
          ) : (
            <>{t("dill.lockedUntil", { date: formatDate(unlockTime) })}</>
          )
        ) : (
          t("dill.unlocked")
        )}
      </h2>
      <DataPoint>
        <div>
          <span>{isFetchingData ? "--" : formatNumber(lockedAmountValue)}</span>
          <PickleIcon size={24} margin="0 0 0 0.5rem" />
          &nbsp;=&nbsp;
        </div>
        <div>
          <Tooltip
            placement="bottom"
            style={{ cursor: "help" }}
            text={t("dill.yourShare", {
              percentage: formatPercent(ratio, 1, 5),
            })}
          >
            <span>{isFetchingData ? "--" : formatNumber(dillBalanceValue)}</span>
            &nbsp;DILL
            <img src="/question.svg" style={{ marginLeft: 8, width: 15 }} />
          </Tooltip>
        </div>
      </DataPoint>
    </Card>
  );
};

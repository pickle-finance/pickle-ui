import { useTranslation } from "next-i18next";
import { FC } from "react";
import { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatDollars, formatNumber } from "v2/utils";
import { DistributionDataPoint } from "./HistoricChart";
import dayjs from "v1/util/dayjs";

const CustomTooltip: FC<{
  active: any;
  payload: Payload<ValueType, NameType>[] | undefined;
  chartMode: "monthly" | "weekly";
}> = ({ active, payload, chartMode }) => {
  const { t } = useTranslation("common");
  const period = chartMode === "monthly" ? "Month" : "Week";

  if (active && payload && payload.length > 0) {
    let thisPayload: DistributionDataPoint = payload[0].payload;
    const showPickle = thisPayload.pickleAmount !== 0;
    const showEth = thisPayload.ethAmount !== 0;

    const periodRewards: string = formatDollars(
      thisPayload.ethPriceUsd * thisPayload.ethAmount +
        thisPayload.picklePriceUsd * thisPayload.pickleAmount,
    );
    const distributionTime =
      chartMode === "monthly"
        ? dayjs(thisPayload.distributionTime).format("MMM YYYY")
        : thisPayload.distributionTime;
    const ethPriceUsd: string = formatDollars(thisPayload.ethPriceUsd, 2);
    const ethAmount: string = formatNumber(thisPayload.ethAmount, 3);
    const ethUsd: string = formatDollars(thisPayload.ethAmount * thisPayload.ethPriceUsd);
    const picklePriceUsd: string = formatDollars(thisPayload.picklePriceUsd, 2);
    const pickleAmount: string = formatNumber(thisPayload.pickleAmount);
    const pickleUsd: string = formatDollars(thisPayload.pickleAmount * thisPayload.picklePriceUsd);
    const usdPerDill: string | undefined = formatNumber(thisPayload.usdPerDill, 4);

    return (
      <div className="bg-background-lightest p-5 rounded border border-foreground-alt-200">
        <div className="flex justify-center mb-4">
          <p className="text-foregroung-alt-200 text-lg">{t("v2.dill.tooltip.title")}</p>
        </div>
        <table>
          <tbody>
            {distributionTime && (
              <TooltipRow label={t("v2.dill.tooltip.distributionTime")} value={distributionTime} />
            )}
            {periodRewards && (
              <TooltipRow
                label={t("v2.dill.tooltip.periodRewardsUsd", {
                  period: period,
                })}
                value={periodRewards}
              />
            )}
            {showEth && ethPriceUsd && (
              <TooltipRow label={t("v2.dill.tooltip.ethPriceUsd")} value={ethPriceUsd} />
            )}
            {showEth && ethAmount && (
              <TooltipRow label={t("v2.dill.tooltip.ethAmount")} value={ethAmount} />
            )}
            {showEth && ethUsd && (
              <TooltipRow label={t("v2.dill.tooltip.ethThisPeriod")} value={ethUsd} />
            )}

            {showPickle && picklePriceUsd && (
              <TooltipRow label={t("v2.dill.tooltip.picklePriceUsd")} value={picklePriceUsd} />
            )}
            {showPickle && pickleAmount && (
              <TooltipRow label={t("v2.dill.tooltip.pickleAmount")} value={pickleAmount} />
            )}
            {showPickle && pickleUsd && (
              <TooltipRow label={t("v2.dill.tooltip.pickleThisPeriod")} value={pickleUsd} />
            )}
            {usdPerDill && (
              <TooltipRow label={t("v2.dill.tooltip.usdPerDill")} value={usdPerDill} />
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

const TooltipRow: FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <tr className="border-b border-dotted border-foreground-alt-200">
    <td>
      <p className="text-foreground-alt-200">{label}</p>
    </td>
    <td className="ml-16 pl-16">
      <p className="text-foreground-alt-200">{value}</p>
    </td>
  </tr>
);

export default CustomTooltip;

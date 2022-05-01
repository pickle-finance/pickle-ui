import { useTranslation } from "next-i18next";
import { FC } from "react";
import { formatPercentage } from "v2/utils";

const CustomTooltip: FC<{ active: any; payload: any }> = ({ active, payload }) => {
  const { t } = useTranslation("common");

  if (active && payload && payload.length) {
    const chain: string | undefined = payload[0].payload.chain || undefined;
    const chainVisible: string | undefined = payload[0].payload.chainVisible || undefined;
    const asset: string | undefined = payload[0].payload.jar || undefined;
    const weight: number | undefined = payload[0].value || undefined;
    const platformWeight: number | undefined = payload[0].payload.platformWeight || undefined;

    return (
      <div className="bg-background-light p-5 rounded border border-foreground-alt-300">
        <table>
          {chainVisible && (
            <TooltipRow label={t("v2.dill.vote.charts.tooltips.chain")} value={chainVisible} />
          )}
          {asset && <TooltipRow label={t("v2.dill.vote.charts.tooltips.asset")} value={asset} />}
          {weight && (
            <TooltipRow
              label={t("v2.dill.vote.charts.tooltips.chainWeight")}
              value={formatPercentage(weight * 100, 3)}
            />
          )}
          {platformWeight && (
            <TooltipRow
              label={t("v2.dill.vote.charts.tooltips.platformWeight")}
              value={formatPercentage(platformWeight * 100, 5)}
            />
          )}
        </table>
      </div>
    );
  }

  return null;
};

const TooltipRow: FC<{ label: string; value: string }> = ({ label, value }) => (
  <tr className="grid grid-cols-2 gap-5">
    <td>
      <p className="text-foreground-alt-200 col-span-1">{label}</p>
    </td>
    <td>
      <p className="text-foreground-alt-200 col-span-2">{value}</p>
    </td>
  </tr>
);

export default CustomTooltip;

import { useTranslation } from "next-i18next";
import { FC } from "react";
import { NameType, Payload, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { formatDollars, formatPercentage } from "v2/utils";

const CustomTooltip: FC<{ active: any; payload: Payload<ValueType, NameType>[] | undefined }> = ({
  active,
  payload,
}) => {
  const { t } = useTranslation("common");

  if (active && payload && payload.length) {
    const name: string | undefined = payload[0].payload.name || undefined;
    const tvl: number | undefined = payload[0].payload.tvl || undefined;
    const apr: number | undefined = payload[0].payload.apr || undefined;
    const apy: number | undefined = payload[0].payload.apy || undefined;

    return (
      <div className="bg-background-light p-5 rounded border border-foreground-alt-300">
        <table>
          <tbody>
            {name && <TooltipRow label={t("v2.stats.tooltips.name")} value={name} />}
            {tvl && <TooltipRow label={t("v2.stats.tooltips.tvl")} value={formatDollars(tvl)} />}
            {apr && (
              <TooltipRow label={t("v2.stats.tooltips.jarApr")} value={formatPercentage(apr)} />
            )}
            {apy && (
              <TooltipRow label={t("v2.stats.tooltips.farmApy")} value={formatPercentage(apy)} />
            )}
          </tbody>
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

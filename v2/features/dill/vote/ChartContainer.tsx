import React, { FC } from "react";
import PieChart from "./WeightsPieChart";
import { useTranslation } from "next-i18next";
import { UserData } from "picklefinance-core/lib/client/UserModel";
import { PickleModelJson } from "picklefinance-core";

const ChartContainer: FC<{
  platformOrUser: "platform" | "user";
  mainnet: boolean;
  user?: UserData | undefined;
  core?: PickleModelJson.PickleModelJson
}> = ({ platformOrUser, mainnet, user, core }) => {
  const { t } = useTranslation("common");

  return (
    <div className="w-full rounded-xl border border-foreground-alt-500 p-4 sm:p-8 mb-10">
      <h2 className="font-body font-bold text-xl">{t("v2.dill.vote.charts.platformTitle")}</h2>
      <aside className="h-[450px] px-3 py-10">
        <PieChart platformOrUser={platformOrUser} mainnet={mainnet} user={user} core={core} />
      </aside>
    </div>
  );
};

export default ChartContainer;

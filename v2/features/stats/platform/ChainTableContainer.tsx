import { useTranslation } from "next-i18next";
import { FC } from "react";
import { PlatformChainData, SetFunction } from "v2/types";
import { classNames } from "v2/utils";
import ChainTable from "./ChainTable";

const ChainTableContainer: FC<{
  chains: PlatformChainData;
  className?: string;
  setChain: SetFunction;
}> = ({ chains, className, setChain }) => {
  const { t } = useTranslation("common");
  return (
    <div
      className={classNames(
        "bg-background-light w-full min-w-min rounded-xl border border-foreground-alt-500 shadow",
        className,
      )}
    >
      <h2 className="font-body font-bold text-xl text-foreground-alt-200 p-4">
        {t("v2.stats.platform.chainTableTitle")}
      </h2>
      <div className="p-2 pb-4">
        <div className="max-h-[550px] overflow-y-auto p-2">
          <ChainTable chains={chains} setChain={setChain} />
        </div>
      </div>
    </div>
  );
};

export default ChainTableContainer;

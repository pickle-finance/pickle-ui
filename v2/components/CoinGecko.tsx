import { FC } from "react";
import { useTranslation } from "next-i18next";
import Link from "./Link";


const CoinGeckoAttribution: FC = () => {
  const { t } = useTranslation("common");

  return (
    <Link href="https://www.coingecko.com/en/api" external>
      <p className="text-foreground-alt-300 text-sm">{t("v2.misc.coinGeckoAttribution")}</p>
    </Link>
  );
};

export default CoinGeckoAttribution;

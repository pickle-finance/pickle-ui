import { FC, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Skeleton from "@material-ui/lab/Skeleton";
import useSWR from "swr";
import { useTranslation } from "next-i18next";
import { AdvancedChartWidgetProps } from "react-tradingview-embed";

import { fetcher, PicklePriceResponse } from "../utils";
import Modal from "./Modal";
import { useAppSelector } from "v2/store";
import { ThemeSelectors } from "v2/store/theme";
import Link from "./Link";

interface AdvancedChartProps {
  widgetProps?: AdvancedChartWidgetProps;
  children?: never;
}

const TradeViewChart = dynamic<AdvancedChartProps>(
  () => import("react-tradingview-embed").then(({ AdvancedChart }) => AdvancedChart),
  { ssr: false },
);

const PicklePriceIndicatorBody: FC = () => {
  const endpoint =
    "https://api.coingecko.com/api/v3/simple/price?ids=pickle-finance&vs_currencies=usd";
  const { data } = useSWR<PicklePriceResponse>(endpoint, fetcher);

  if (!data)
    return (
      <Skeleton
        width="45px"
        height="26px"
        style={{
          background: "#0f1f22",
        }}
      />
    );

  return (
    <span className="text-foreground group-hover:text-primary-light transition duration-300 ease-in-out">
      ${data["pickle-finance"].usd}
    </span>
  );
};

const PicklePriceIndicator: FC = () => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const themeTone = useAppSelector(ThemeSelectors.selectThemeTone);

  return (
    <>
      <div
        className="flex items-center group cursor-pointer px-4 py-2 text-foreground text-sm font-bold"
        onClick={() => setIsOpen(true)}
      >
        <div className="w-11 p-2 bg-background-light rounded-3xl mr-2">
          <Image
            src="/pickle-icon.svg"
            width={200}
            height={200}
            layout="responsive"
            alt="Pickle Finance"
            title="Pickle Finance"
            className="group-hover:scale-110 transition duration-300 ease-in-out"
          />
        </div>
        <PicklePriceIndicatorBody />
      </div>
      <Modal
        size="xl"
        isOpen={isOpen}
        closeModal={() => setIsOpen(false)}
        title={t("v2.dashboard.pickleToken")}
        footer={
          <>
            <Link
              href="https://etherscan.io/address/0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5"
              external
            >
              {t("v2.dashboard.contract")}
            </Link>
            <span className="text-foreground-alt-300 mx-2">&#x2022;</span>
            <Link href="https://www.coingecko.com/en/coins/pickle-finance" external>
              CoinGecko
            </Link>
            <span className="text-foreground-alt-300 mx-2">&#x2022;</span>
            <Link href="https://coinmarketcap.com/currencies/pickle-finance" external>
              CoinMarketCap
            </Link>
            <span className="text-foreground-alt-300 mx-2">&#x2022;</span>
            <Link href="https://www.tradingview.com/chart/?symbol=OKEX%3APICKLEUSDT" external>
              TradingView
            </Link>
          </>
        }
      >
        <TradeViewChart
          widgetProps={{
            theme: themeTone,
            hide_top_toolbar: true,
            symbol: "OKEX:PICKLEUSDT",
            interval: "15",
            timezone: "Etc/UTC",
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
          }}
        />
      </Modal>
    </>
  );
};

export default PicklePriceIndicator;

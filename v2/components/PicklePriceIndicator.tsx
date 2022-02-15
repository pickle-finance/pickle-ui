import { FC } from "react";
import Image from "next/image";
import Skeleton from "@material-ui/lab/Skeleton";
import useSWR from "swr";

import { fetcher, PicklePriceResponse } from "../utils";

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

  return <span>${data["pickle-finance"].usd}</span>;
};

const PicklePriceIndicator: FC = () => (
  <div className="flex items-center px-4 py-2 mb-2 text-base text-sm font-bold">
    <div className="w-11 p-2 bg-black-light rounded-3xl mr-2">
      <Image
        src="/pickle-icon.svg"
        width={200}
        height={200}
        layout="responsive"
        alt="Pickle Finance"
        title="Pickle Finance"
      />
    </div>
    <PicklePriceIndicatorBody />
  </div>
);

export default PicklePriceIndicator;

import { FC } from "react";
import Image from "next/image";
import Skeleton from "@material-ui/lab/Skeleton";
import useSWR from "swr";

import logo from "../../public/pickle.png";
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
  <div className="flex items-center px-4 py-2 mb-2 text-white text-sm font-bold">
    <div className="w-10 p-2 bg-black-light rounded-3xl mr-2">
      <Image
        src={logo}
        width={80}
        height={80}
        layout="responsive"
        alt="Pickle Finance"
        title="Pickle Finance"
        placeholder="blur"
      />
    </div>
    <PicklePriceIndicatorBody />
  </div>
);

export default PicklePriceIndicator;

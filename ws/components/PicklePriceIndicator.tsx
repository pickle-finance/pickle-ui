import { FC } from "react";
import Image from "next/image";

import logo from "../../public/pickle.png";

const PicklePriceIndicator: FC = () => {
  return (
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
      $19.74
    </div>
  );
};

export default PicklePriceIndicator;

import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

import { classNames, formatDollars } from "v2/utils";
import FarmsBadge from "./FarmsBadge";
import {
  UserData,
  UserTokenData,
} from "picklefinance-core/lib/client/UserModel";
import { useSelector } from "react-redux";
import { UserSelectors } from "v2/store/user";
import { BigNumber } from "@ethersproject/bignumber";
import { CoreSelectors } from "v2/store/core";

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-black-light p-4 whitespace-nowrap text-sm text-white sm:p-6 group-hover:bg-black-lighter transition duration-300 ease-in-out",
      className,
    )}
  >
    {children}
  </td>
);

interface Props {
  simple?: boolean;
  open: boolean;
  jar: JarDefinition;
}

const FarmsTableRowHeader: FC<Props> = ({ jar, simple, open }) => {
  const userModel: UserData | undefined = useSelector(UserSelectors.selectData);
  const allCore = useSelector(CoreSelectors.selectCore);
  let picklePrice = 0;
  if (allCore) {
    picklePrice = allCore.prices.pickle;
  }
  let picklesPending = 0;
  if (userModel) {
    const userTokenDetails: UserTokenData | undefined = userModel.tokens.find(
      (x) => x.assetKey === jar.details.apiKey,
    );
    if (userTokenDetails) {
      picklesPending =
        BigNumber.from(userTokenDetails.picklePending)
          .div(1e10)
          .div(1e6)
          .toNumber() / 100;
    }
  }
  const pendingPicklesAsDollars = picklesPending * picklePrice;

  return (
    <>
      <RowCell
        className={classNames(
          !open && "rounded-bl-xl",
          "rounded-tl-xl flex items-center",
        )}
      >
        <div className="w-9 h-9 rounded-full border-3 border-gray-outline mr-3">
          <Image
            src="/alchemix.png"
            className="rounded-full"
            width={200}
            height={200}
            layout="responsive"
            alt={jar.depositToken.name}
            title={jar.depositToken.name}
          />
        </div>
        <div>
          <p className="font-title font-medium text-base leading-5 group-hover:text-green-light transition duration-300 ease-in-out">
            {jar.depositToken.name}
          </p>
          <p className="italic font-normal text-xs text-gray-light">
            {jar.protocol}
          </p>
        </div>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(pendingPicklesAsDollars)}
        </p>
        <p className="font-normal text-xs text-gray-light">
          {picklesPending} PICKLEs
        </p>
      </RowCell>
      <RowCell>
        <div className="flex items-center">
          <FarmsBadge active />
          <div className="ml-2">
            <p className="font-title font-medium text-base leading-5">
              {formatDollars(9000)}
            </p>
            <p className="font-normal text-xs text-gray-light">10.33 LP</p>
          </div>
        </div>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">42%</p>
      </RowCell>
      <RowCell className={classNames(simple && "rounded-r-xl")}>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(jar.details.harvestStats?.balanceUSD || 0)}
        </p>
      </RowCell>
      {!simple && (
        <RowCell
          className={classNames(!open && "rounded-br-xl", "rounded-tr-xl w-10")}
        >
          <div className="flex justify-end pr-3">
            <ChevronDownIcon
              className={classNames(
                open && "transform rotate-180",
                "text-white ml-2 h-5 w-5 transition duration-300 ease-in-out",
              )}
              aria-hidden="true"
            />
          </div>
        </RowCell>
      )}
    </>
  );
};

export default FarmsTableRowHeader;

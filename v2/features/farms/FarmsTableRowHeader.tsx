import { FC, HTMLAttributes } from "react";
import Image from "next/image";
import { ChevronDownIcon } from "@heroicons/react/solid";
import {
  JarDefinition,
  AssetProtocol,
} from "picklefinance-core/lib/model/PickleModelJson";

import { classNames, formatDollars, protocolIdToName } from "v2/utils";
import FarmsBadge from "./FarmsBadge";

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
            {protocolIdToName(jar.protocol as AssetProtocol)}
          </p>
        </div>
      </RowCell>
      <RowCell>
        <p className="font-title font-medium text-base leading-5">
          {formatDollars(100)}
        </p>
        <p className="font-normal text-xs text-gray-light">9.3 PICKLEs</p>
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

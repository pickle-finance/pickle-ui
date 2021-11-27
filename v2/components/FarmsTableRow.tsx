import { FC, HTMLAttributes } from "react";

import { classNames } from "../utils";

const RowCell: FC<HTMLAttributes<HTMLElement>> = ({ children, className }) => (
  <td
    className={classNames(
      "bg-black-light p-4 whitespace-nowrap text-sm text-white sm:p-6",
      className,
    )}
  >
    {children}
  </td>
);

interface Props {
  farm: {
    asset: string;
    earned: number;
    deposited: number;
    apy: string;
    liquidity: number;
  };
}

const FarmsTableRow: FC<Props> = ({ farm }) => {
  return (
    <tr>
      <RowCell className="rounded-l-xl">{farm.asset}</RowCell>
      <RowCell>{farm.earned}</RowCell>
      <RowCell>{farm.deposited}</RowCell>
      <RowCell>{farm.apy}</RowCell>
      <RowCell className="rounded-r-xl">{farm.liquidity}</RowCell>
    </tr>
  );
};

export default FarmsTableRow;

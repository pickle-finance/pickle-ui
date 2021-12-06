import { FC } from "react";

import { Farm } from "v2/types";

interface Props {
  farm: Farm;
}

const FarmsTableRowBody: FC<Props> = () => {
  return (
    <td colSpan={6} className="bg-black-light rounded-b-xl">
      Disclosure panel body
    </td>
  );
};

export default FarmsTableRowBody;

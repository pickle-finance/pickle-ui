import { FC } from "react";

/**
 * A dummy table row we use to add space between table rows.
 * Since table rows won't apply margins, the only other option would
 * be border spacing but we can't apply it to the whole table (e.g. there
 * is no margin between expandable row header and its body).
 */
const FarmsTableSpacerRow: FC = () => {
  return (
    <tr>
      <td colSpan={6} className="bg-background p-1"></td>
    </tr>
  );
};

export default FarmsTableSpacerRow;

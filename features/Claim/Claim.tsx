import { FC, useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Card } from "@geist-ui/react";

import {
  getClaimsByWeek,
  getUnclaimedAmountsByWeek,
  getClaimableAmount,
  Token,
} from "features/Claim/utils";
import { Connection } from "containers/Connection";

interface Props {
  token: Token;
}

const Claim: FC<Props> = ({ token }) => {
  const { signer, address } = Connection.useContainer();
  const [claimableAmount, setClaimableAmount] = useState<number>(-1);

  useEffect(() => {
    if (signer && address) {
      const fetchData = async () => {
        const claimsByWeek = await getClaimsByWeek(token);
        const unclaimedAmounts = await getUnclaimedAmountsByWeek(
          token,
          claimsByWeek,
          address,
          signer,
        );

        setClaimableAmount(getClaimableAmount(unclaimedAmounts));
      };

      fetchData();
    }
  }, [address]);

  return (
    <Card>
      <h2>Claim {token}</h2>
      {claimableAmount < 0 ? (
        <Skeleton
          animation="wave"
          width="180px"
          height="26px"
          style={{
            backgroundColor: "#FFF",
            opacity: 0.1,
          }}
        />
      ) : (
        <p>
          Claimable Amount: {claimableAmount} {token}
        </p>
      )}
    </Card>
  );
};

export default Claim;

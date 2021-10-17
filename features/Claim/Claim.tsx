import { FC, useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Card } from "@geist-ui/react";

import {
  generateClaim,
  generateMerkleTree,
  getClaimableAmount,
  getClaimsByWeek,
  getUnclaimedAmountsByWeek,
  Token,
  verifyClaim,
} from "features/Claim/utils";
import { Connection } from "containers/Connection";

interface Props {
  token: Token;
}

const Claim: FC<Props> = ({ token }) => {
  const { signer, address } = Connection.useContainer();
  const [claimableAmount, setClaimableAmount] = useState<number>(-1);

  const fetchClaimableAmount = async () => {
    if (!address) return;

    setClaimableAmount(-1);

    const claimsByWeek = await getClaimsByWeek(token);
    const unclaimedAmounts = await getUnclaimedAmountsByWeek(
      token,
      claimsByWeek,
      address,
      signer,
    );

    for (const [week, amount] of Object.entries(unclaimedAmounts)) {
      const merkleTree = generateMerkleTree(claimsByWeek[week]);
      const claim = generateClaim(merkleTree, week, amount, address);
      console.log(
        "============= ",
        await verifyClaim(claim, address, token, signer),
      );
    }

    setClaimableAmount(getClaimableAmount(unclaimedAmounts));
  };

  useEffect(() => {
    fetchClaimableAmount();
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

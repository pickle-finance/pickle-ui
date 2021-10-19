import { FC, useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Card } from "@geist-ui/react";

import { BalancerRedeemer, Token } from "features/Claim/BalancerRedeemer";
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

    const redeemer = new BalancerRedeemer(token, address, signer);
    await redeemer.fetchData();

    for (const week of redeemer.claimableWeeks) {
      const claim = redeemer.generateClaim(week);
      console.log("============= ", await redeemer.verifyClaim(claim));
    }

    setClaimableAmount(redeemer.claimableAmount);
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

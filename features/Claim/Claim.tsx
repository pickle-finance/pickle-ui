import { FC, useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Card } from "@geist-ui/react";

import { BalancerRedeemer } from "features/Claim/BalancerRedeemer";
import { Connection } from "containers/Connection";
import { tokenClaimInfoList } from "./config";

const Claim: FC = () => {
  const { signer, address } = Connection.useContainer();
  const [claimableAmount, setClaimableAmount] = useState<number>(-1);

  const fetchClaimableAmount = async () => {
    if (!address) return;

    const redeemer = new BalancerRedeemer(tokenClaimInfoList[0], 0, address);
    await redeemer.fetchData();

    console.log("================", redeemer.claimableWeeks);

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
      <h2>Claim Balancer rewards</h2>
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
        <p>Claimable Amount: {claimableAmount} BAL</p>
      )}
    </Card>
  );
};

export default Claim;

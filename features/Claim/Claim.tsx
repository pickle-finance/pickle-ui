import { FC, useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Card } from "@geist-ui/react";

import { Connection } from "containers/Connection";
import { Prices } from "containers/Prices";
import { BalancerClaimsManager } from "features/Claim/BalancerClaimsManager";
import { ClaimableAmounts } from "./types";

const Claim: FC = () => {
  const { address } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const [claimsManager, setClaimsManager] = useState<BalancerClaimsManager>();

  const refreshClaimsManager = async () => {
    if (!address) return;
    if (!prices) return;

    const manager = new BalancerClaimsManager(address, prices);
    await manager.fetchData();

    setClaimsManager(manager);
  };

  const claimableAmountsList = () => {
    if (!claimsManager) return null;

    return Object.entries(claimsManager.claimableAmounts).map(
      ([token, amounts]) => {
        return (
          <p key={token}>
            Claimable Amount: {amounts[token]} {token}
          </p>
        );
      },
    );
  };

  useEffect(() => {
    refreshClaimsManager();
  }, [address, !!prices]);

  return (
    <Card>
      <h2>Claim Balancer rewards</h2>
      {!claimsManager ? (
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
        <>
          {claimableAmountsList()}
          {claimsManager.claimableAmountUsd >= 0 && (
            <p>Total Claimable Amount: ${claimsManager.claimableAmountUsd}</p>
          )}
        </>
      )}
    </Card>
  );
};

export default Claim;

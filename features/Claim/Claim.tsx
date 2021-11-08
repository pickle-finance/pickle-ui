import { FC, useEffect, useState } from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import { Card, Button } from "@geist-ui/react";

import { Connection } from "containers/Connection";
import { Prices } from "containers/Prices";
import { BalancerClaimsManager } from "features/Claim/BalancerClaimsManager";

const Claim: FC = () => {
  const { address, signer } = Connection.useContainer();
  const { prices } = Prices.useContainer();
  const [claimsManager, setClaimsManager] = useState<BalancerClaimsManager>();

  // Transaction state trackers
  const [isInProgress, setIsInProgress] = useState<boolean>(false);
  const [receipt, setReceipt] = useState<any>();

  const refreshClaimsManager = async () => {
    if (!address) return;
    if (!prices) return;

    const manager = new BalancerClaimsManager(address, signer, prices);
    await manager.fetchData();

    // Debug:
    // for (let i = 0; i < manager.claims.length; i++) {
    //   const claim = manager.claims[i];
    //   const tokenClaim = manager.tokenClaims[claim.tokenIndex];
    //   console.log(
    //     "=============== verifying claim",
    //     claim,
    //     await tokenClaim.verifyClaim(claim),
    //   );
    // }

    setClaimsManager(manager);
  };

  useEffect(() => {
    refreshClaimsManager();
  }, [address, !!prices, receipt]);

  const claim = async () => {
    if (!claimsManager) return null;

    setIsInProgress(true);

    try {
      const result = await claimsManager.claimDistributions();
      const receipt = await result.wait();
      setReceipt(receipt);
    } catch {
      setReceipt("failed");
      setIsInProgress(false);
    }

    // Refresh balances.
    setClaimsManager(undefined);
    setIsInProgress(false);
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
            <>
              <p>Total Claimable Amount: ${claimsManager.claimableAmountUsd}</p>
              <Button disabled={isInProgress} onClick={claim}>
                Claim
              </Button>
            </>
          )}
        </>
      )}
    </Card>
  );
};

export default Claim;

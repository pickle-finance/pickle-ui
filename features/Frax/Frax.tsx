import { FC, useState } from "react";
import { Button, Link, Input, Grid, Spacer, Card } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";
import { ButtonStatus } from "hooks/useButtonStatus";
import { Connection } from "containers/Connection";

export const FraxFeature: FC = () => {

  const { blockNum, address, signer } = Connection.useContainer();

  const [stakeAmount, setStakeAmount] = useState("");
  const [stakeButton, setStakeButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Stake",
  });
  const [claimButton, setClaimButton] = useState<ButtonStatus>({
    disabled: false,
    text: "Claim Rewards",
  });
  
  return (
    <>
  <Card>
      <h2>Stake FXS</h2>
      <Grid.Container gap={2}>
        <Grid md={24}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Balance: 9001 fxs
            </div>
            <Link
              color
              href="#"
              onClick={(e) => {
                if (1) {
                  e.preventDefault();
                  setStakeAmount(formatEther(1e18.toString()));
                }
              }}
            >
              Max
            </Link>
          </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setStakeAmount(e.target.value)}
            value={stakeAmount}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <Button
            disabled={stakeButton.disabled}
            onClick={() => {

            }}
            style={{ width: "100%" }}
          >
            {stakeButton.text}
          </Button>
        </Grid>
        <Spacer />
        <Grid xs={24}>
          <Spacer />
          <Button
            disabled={claimButton.disabled}
            onClick={() => {
            }}
            style={{ width: "100%" }}
          >
            {claimButton.text}
          </Button>
          <Spacer y={1} />
        </Grid>
      </Grid.Container>
    </Card>
    </>
  );
};

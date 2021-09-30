import { ethers } from "ethers";
import React, { useState, FC, useEffect } from "react";
import { Grid, Card, Spacer } from "@geist-ui/react";
import { TradeButton } from "features/Prices/Prices";
import erc20 from "@studydefi/money-legos/erc20";
import { Connection } from "containers/Connection";
import { Prices } from "containers/Prices";
import { config } from "containers/config";
import { Contracts } from "containers/Contracts";
import { formatEther } from "@ethersproject/units";

const BALANCER_VAULT = "0xba12222222228d8ba445958a75a0704d566bf2c8";

export const BalFarm: FC = () => {
  const { provider, blockNum } = Connection.useContainer();
  const { pickle } = Contracts.useContainer();
  const { prices } = Prices.useContainer();
  const [apy, setApy] = useState("0");

  const getBalancerStats = async () => {
    if (provider && prices && pickle) {
      const pickleLocked = await pickle.balanceOf(BALANCER_VAULT);
      const valueLocked = (+formatEther(pickleLocked) * prices.pickle) / 0.8; // 80/20 pool
      const balDistributed = 42995;
      const apy = (balDistributed * prices.bal * 100) / valueLocked;
      setApy(apy.toFixed(2));
    }
  };

  useEffect(() => {
    getBalancerStats();
  }, [blockNum]);

  return (
    <>
      <Grid.Container gap={2}>
        <Grid xs={24} sm={14} md={14}>
          <Card>
            <Grid.Container>
              <Grid xs={14} md={16}>
                <div style={{ fontSize: "large" }}>
                  {" "}
                  Farm PICKLE on Balancer
                  <img
                    style={{ width: "50px", verticalAlign: "middle" }}
                    src="balancer.png"
                  />
                </div>
                at{" "}
                <b
                  style={{
                    color: "#53ffe2",
                  }}
                >
                  {apy}%
                </b>{" "}
                APR
              </Grid>
              <Grid xs={10} md={8}>
                <TradeButton
                  href={
                    "https://arbitrum.balancer.fi/#/pool/0xc2f082d33b5b8ef3a7e3de30da54efd3114512ac000200000000000000000017"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: "7px" }}
                >
                  Add liquidity
                </TradeButton>
              </Grid>
            </Grid.Container>
          </Card>
        </Grid>
        <Grid xs={24} sm={10} md={10}>
          <Card style={{ height: "100%" }}>
            {" "}
            <Grid.Container>
              <Grid xs={12}>
                <div>Bridge your Ethereum assets to Arbitrum</div>
              </Grid>
              <Grid xs={12}>
                <TradeButton
                  href={"https://bridge.arbitrum.io/"}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ marginTop: "7px" }}
                >
                  Bridge
                </TradeButton>
              </Grid>
            </Grid.Container>
          </Card>
        </Grid>
      </Grid.Container>
    </>
  );
};

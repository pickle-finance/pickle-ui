import { FC, useState } from "react";
import { Spacer, Select } from "@geist-ui/react";

import { PickleStaking } from "../../containers/PickleStaking";

import { Balances } from "./Balances";
import { Interaction } from "./Interaction";

export const Stake: FC = () => {
  const { SCRVRewards, WETHRewards } = PickleStaking.useContainer();

  const rewards = {
    WETH: WETHRewards,
    sCRV: SCRVRewards,
  };

  const deprecated = ["sCRV"];

  const [selectedRewards, setSelectedRewards] = useState<string>(
    Object.keys(rewards)[0],
  );

  return (
    <>
      <Select
        size="large"
        width="100%"
        style={{ maxWidth: "100%" }}
        value={selectedRewards}
        onChange={(e) => setSelectedRewards(e)}
      >
        {Object.keys(rewards).map((x) => (
          <Select.Option style={{ fontSize: "1rem" }} value={x}>
            {deprecated.includes(x) ? `${x} (Deprecated)` : x}
          </Select.Option>
        ))}
      </Select>
      {selectedRewards === "sCRV" && (
        <>
          <Spacer />
          <p>
            <a
              href="https://app.uniswap.org/#/swap?outputCurrency=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48&inputCurrency=0xc25a3a3b969415c80451098fa907ec722572917f"
              target="_blank"
              rel="noopener noreferrer"
            >
              Click here
            </a>{" "}
            to trade sCRV for other tokens.
          </p>
        </>
      )}
      <Spacer />
      <Balances
        stakingRewards={rewards[selectedRewards as keyof typeof rewards]}
        rewardsTokenName={selectedRewards}
      />
      <Spacer />
      <Interaction
        stakingRewards={rewards[selectedRewards as keyof typeof rewards]}
      />
    </>
  );
};

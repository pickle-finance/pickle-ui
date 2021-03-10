import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Checkbox } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";
import {
  JAR_GAUGE_MAP,
  PICKLE_ETH_GAUGE,
} from "../../containers/Gauges/gauges";
import { TransactionStatus, useGaugeProxy } from "../../hooks/useGaugeProxy";
import { PercentageInput } from "../../components/PercentageInput";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { FARM_LP_TO_ICON as GAUGE_LP_TO_ICON } from "../Farms/FarmCollapsible";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import Collapse from "../Collapsible/Collapse";
import { isArray } from "util";

interface Weights {
  [key: string]: number;
}

const Label = styled.div`
  font-family: "Source Sans Pro";
`;

interface DataProps {
  isZero?: boolean;
}

const Data = styled.div<DataProps>`
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${(props) => (props.isZero ? "#444" : "unset")};
`;

export const VoteCollapsible: FC = () => {
  const { gaugeData } = UserGauges.useContainer();
  const [votingFarms, setVotingFarms] = useState();
  const [voteWeights, setVoteWeights] = useState<Weights>({});
  const { status: voteTxStatus, vote } = useGaugeProxy();

  if (!gaugeData) {
    return null;
  }
  const activeGauges = gaugeData.filter((x) => true);

  const renderSelectOptions = (gauge: UserGaugeData) => (
    <Select.Option value={gauge.address}>
      <Checkbox>{gauge.address}</Checkbox>
    </Select.Option>
  );

  const handleSelect = (addresses: string | string[]) => {
    const selectedFarms = isArray(addresses)
      ? addresses.map((x) => activeGauges.find((y) => y.address === x))
      : null;

    setVotingFarms(selectedFarms);
  };

  const renderVotingOption = (gauge: UserGaugeData) => {
    const {
      poolName,
      depositToken,
      depositTokenName,
      balance,
      staked,
      harvestable,
      usdPerToken,
      apy,
    } = gauge;

    console.log("gauge apy", gauge.apy)
    return (
      <>
        <Grid xs={24} sm={12} md={6} lg={6}>
          <TokenIcon
            src={
              GAUGE_LP_TO_ICON[
                depositToken.address as keyof typeof GAUGE_LP_TO_ICON
              ]
            }
          />
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: `1rem` }}>{poolName}</div>
            <Label style={{ fontSize: `1rem` }}>{depositTokenName}</Label>
          </div>
        </Grid>
        <Grid xs={24} sm={6} md={6} lg={6} css={{ textAlign: "center" }}>
           <Data isZero={parseFloat(formatEther(harvestable || 0)) === 0}>
              asdf
            </Data>
          <Label>Current PICKLE APY</Label>
        </Grid>
        <Grid xs={24} sm={6} md={6} lg={6} css={{ textAlign: "center" }}>
          <div>Current PICKLE APY: 10%</div>
        </Grid>
        <Grid xs={24} sm={6} md={6} lg={6} css={{ textAlign: "center" }}>
          <PercentageInput
            placeholder="0%"
            css={{
              width: "60px !important",
              minWidth: 0,
              marginLeft: 30,
            }}
            onValueChange={({ floatValue }) => {
              setVoteWeights({
                ...voteWeights,
                [gauge.address]: floatValue,
              });
            }}
          />
        </Grid>
      </>
    );
  };

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={
        <div>
          Select which farms to allocate PICKLE rewards to using your DILL
          balance
        </div>
      }
    >
      <Spacer y={1} />
      <Select
        placeholder="Select farms to boost"
        multiple
        width="100%"
        initialValue={[]}
        onChange={(value) => handleSelect(value)}
      >
        {activeGauges.map(renderSelectOptions)}
      </Select>
      <Spacer y={0.5} />
      <h3>Selected Farms</h3>
      {votingFarms ? (
        <Grid.Container gap={1}>
          {votingFarms.map(renderVotingOption)}
        </Grid.Container>
      ) : (
        "Please select farms from dropdown"
      )}
    </Collapse>
  );
};

import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Checkbox } from "@geist-ui/react";
import { formatEther } from "ethers/lib/utils";
import {
  JAR_GAUGE_MAP,
  PICKLE_ETH_GAUGE,
} from "../../containers/Gauges/gauges";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import Collapse from "../Collapsible/Collapse";

export const VoteCollapsible: FC = () => {
  const { gaugeData } = UserGauges.useContainer();

  if (!gaugeData) {
    return null;
  }
  const activeGauges = gaugeData.filter((x) => true);

  const renderSelectOptions = (gauge: UserGaugeData) => (
    <Select.Option value={gauge.address}>
      <Checkbox>{gauge.address}</Checkbox>
    </Select.Option>
  );

  const selectHandler = (address: string) => {
    console.log(address);
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
        placeholder="Select farms you wish to boost"
        multiple
        width="100%"
        initialValue={[]}
      >
        {activeGauges.map(renderSelectOptions)}
      </Select>
    </Collapse>
  );
};

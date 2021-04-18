import { formatEther, parseEther } from "ethers/lib/utils";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Input } from "@geist-ui/react";
import { Connection } from "../../containers/Connection";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Dill, UseDillOutput } from "../../containers/Dill";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import Collapse from "../Collapsible/Collapse";
import { pickleWhite } from "../../util/constants";

export const CalcCollapsible: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { gaugeData } = UserGauges.useContainer();
  const { address, signer } = Connection.useContainer();
  const [balance, setBalance] = useState("0");
  const [totalBalance, setTotalBalance] = useState("0");
  const [userChanged, setUserChanged] = useState(false);
  const [dillBalance, setDillBalance] = useState("0");
  console.log("initial dill", dillStats);
  console.log(dillBalance);
  const [boostFactor, setBoostFactor] = useState<number>(1);
  const [dillRequired, setDillRequired] = useState();

  const dillSupplyNum = parseFloat(formatEther(dillStats.totalSupply || 0));
  const dillRatio = dillSupplyNum ? +dillBalance / (dillSupplyNum || 1) : 0;

  const gauges = gaugeData?.filter((x) => true);

  const handleSelect = async (depositToken: string) => {
    const selectedGauge = gauges.find(
      (x) => x.depositTokenName === depositToken,
    );

    if (selectedGauge) {
      setBalance(formatEther(selectedGauge.balance));
      setTotalBalance((selectedGauge.totalSupply / 10 ** 18).toString());
    }
  };

  const calculateBoost = () => {
    const _baseBalance = +balance || 0;
    const _derived = _baseBalance * 0.4;
    const _adjusted = +totalBalance * dillRatio * 0.6;
    const boostFactor =
      Math.min(_baseBalance, _derived + _adjusted) / (_baseBalance * 0.4);
    const dillRequired =
      ((_baseBalance - _derived) * dillSupplyNum) / (+totalBalance * 0.6);
    setBoostFactor(boostFactor);
    setDillRequired(dillRequired);
  };

  const renderSelectOptions = (gauge: UserGaugeData) => (
    <Select.Option
      key={gauge.address}
      style={{ color: pickleWhite }}
      value={gauge.depositTokenName}
    >
      {gauge.depositTokenName}
    </Select.Option>
  );

  useEffect(() => {
    if (!userChanged && dillStats && dillStats.balance)
      setDillBalance(formatEther(dillStats.balance.toString() || 0));
  }, [dillStats]);
  
  if (!gaugeData) {
    return <h2>Loading...</h2>;
  }

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={<h2>PICKLE Boost Calculator</h2>}
    >
      <Spacer y={1} />
      <Grid.Container gap={2}>
        <Grid xs={24} md={12}>
          <Select
            placeholder="Select Farm"
            width="100%"
            onChange={(value) => handleSelect(value as string)}
          >
            {gauges.map(renderSelectOptions)}
          </Select>
          <Spacer y={0.5} />
          <div>Your pToken balance: </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setBalance(e.target.value)}
            value={balance}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <div>Pool balance: </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setTotalBalance(e.target.value)}
            value={totalBalance}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer y={0.5} />
          <div>Your DILL: </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => {
              setDillBalance(e.target.value);
            }}
            value={dillBalance}
            width="100%"
            type="number"
            size="large"
          />
          <Spacer />
          <Button
            disabled={false}
            onClick={calculateBoost}
            style={{ width: "100%" }}
          >
            Calculate
          </Button>
        </Grid>
        <Grid xs={24} md={12}>
          <div>
            PICKLE boost factor: <strong>{boostFactor.toFixed(3)}x</strong>
          </div>
          <Spacer y={0.5} />
          <div>
            DILL required for max boost:{" "}
            <strong>{dillRequired?.toFixed(3) || null}</strong>
          </div>
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};

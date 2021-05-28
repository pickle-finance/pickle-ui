import { formatEther, parseEther } from "ethers/lib/utils";
import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select, Input } from "@geist-ui/react";
import { Connection } from "../../containers/Connection";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Dill, UseDillOutput } from "../../containers/Dill";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import Collapse from "../Collapsible/Collapse";
import { pickleWhite } from "../../util/constants";
import { PICKLE_JARS } from "../../containers/Jars/jars";

export const CalcCollapsible: FC<{
  dillStats: UseDillOutput;
}> = ({ dillStats }) => {
  const { gaugeData } = UserGauges.useContainer();
  const { address, signer } = Connection.useContainer();
  const [balance, setBalance] = useState("0");
  const [totalBalance, setTotalBalance] = useState("0");
  const [userChanged, setUserChanged] = useState(false);
  const [dillBalance, setDillBalance] = useState("0");
  const [boostFactor, setBoostFactor] = useState<number>(1);
  const [dillRequired, setDillRequired] = useState();
  const [selectedGauge, setSelectedGauge] = useState<UserGaugeData>()

  const dillSupplyNum = parseFloat(formatEther(dillStats.totalSupply || 0));
  const dillRatio = dillSupplyNum ? +dillBalance / (dillSupplyNum || 1) : 0;

  const gauges: UserGaugeData = gaugeData?.filter((x) => true);

  const handleSelect = async (depositToken: string) => {
    const selectedGauge: UserGaugeData = gauges.find(
      (x) => x.depositTokenName === depositToken,
    );

    const isUsdc =
    selectedGauge.depositToken.address.toLowerCase() ===
    PICKLE_JARS.pyUSDC.toLowerCase();

    if (selectedGauge) {
      const balance = +formatEther(
        selectedGauge.balance.add(selectedGauge.staked)
      );
      const balanceUSD = (balance * selectedGauge.usdPerToken * (isUsdc ? 1e12 : 1)).toFixed(2);

      setBalance(balanceUSD);
      setTotalBalance(
        (
          (selectedGauge.totalSupply * selectedGauge.usdPerToken) /
          (isUsdc ? 1e6 : 1e18)
        ).toFixed(2),
      );
      setSelectedGauge(selectedGauge)
    }
  };

  const formatAPY = (apy: number) => {
    if (apy === Number.POSITIVE_INFINITY) return "∞%";
    return apy.toFixed(2) + "%";
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
          <div>Your balance ($): </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setBalance(e.target.value)}
            value={balance}
            width="100%"
            type="value"
            size="large"
          />
          <Spacer y={0.5} />
          <div>Pool balance ($): </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => setTotalBalance(e.target.value)}
            value={totalBalance}
            width="100%"
            type="value"
            size="large"
          />
          <Spacer y={0.5} />
          <div>Your DILL: </div>
          <Spacer y={0.5} />
          <Input
            onChange={(e) => {
              setUserChanged(true);
              setDillBalance(e.target.value);
            }}
            value={dillBalance}
            width="100%"
            type="value"
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
          <Spacer y={0.5} />
          <div>
            PICKLE APY:{" "}
            <strong>{selectedGauge ? formatAPY(selectedGauge.fullApy / 2.5 * boostFactor * 100) : "0.00%"}</strong>
          </div>
        </Grid>
      </Grid.Container>
    </Collapse>
  );
};

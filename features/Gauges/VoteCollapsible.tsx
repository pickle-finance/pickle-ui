import { ethers } from "ethers";
import styled from "styled-components";
import { useState, FC, useEffect } from "react";
import { Button, Grid, Spacer, Select } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { TransactionStatus, useGaugeProxy } from "../../hooks/useGaugeProxy";
import { Connection } from "../../containers/Connection";
import { PercentageInput } from "../../components/PercentageInput";
import { UserGaugeData, UserGauges } from "../../containers/UserGauges";
import { Contracts } from "../../containers/Contracts";
import { FARM_LP_TO_ICON as GAUGE_LP_TO_ICON } from "../Farms/FarmCollapsible";
import { Dill, UseDillOutput } from "../../containers/Dill";
import { LpIcon, TokenIcon } from "../../components/TokenIcon";
import Collapse from "../Collapsible/Collapse";
import { pickleWhite } from "../../util/constants";
import {
  ERC20Transfer,
  Status as ERC20TransferStatus,
} from "../../containers/Erc20Transfer";
import {
  JAR_GAUGE_MAP,
  PICKLE_ETH_GAUGE,
} from "../../containers/Gauges/gauges";
import { useUniPairDayData } from "../../containers/Jars/useUniPairDayData";
import { JarApy } from "../../containers/Jars/useJarsWithAPYEth";
import { Jars } from "../../containers/Jars";
import { useButtonStatus, ButtonStatus } from "hooks/useButtonStatus";

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

const formatPercent = (decimal: number) => {
  if (decimal) {
    return (decimal * 100).toFixed(2);
  }
};

const formatAPY = (apy: number) => {
  if (apy === Number.POSITIVE_INFINITY) return "∞%";
  return apy.toFixed(2) + "%";
};

export const VoteCollapsible: FC<{ gauges: UserGaugeData[] }> = ({
  gauges,
}) => {
  const { balance: dillBalanceBN } = Dill.useContainer();
  const [votingFarms, setVotingFarms] = useState();
  const { vote } = useGaugeProxy();
  const { gaugeProxy } = Contracts.useContainer();
  const { blockNum, address, signer } = Connection.useContainer();
  const [voteWeights, setVoteWeights] = useState<Weights>({});
  const [newWeights, setNewWeights] = useState(null);
  const { t } = useTranslation("common");
  const [voteButton, setVoteButton] = useState<ButtonStatus>({
    disabled: false,
    text: t("gauges.submitVote"),
  });
  const {
    status: transferStatus,
    transfer,
    getTransferStatus,
  } = ERC20Transfer.useContainer();
  const { setButtonStatus } = useButtonStatus();

  const [currWeights, setCurrWeights] = useState(
    gauges.map((x) => x.allocPoint),
  );

  let totalGaugeWeight = 0;
  for (let i = 0; i < gauges?.length; i++) {
    totalGaugeWeight += voteWeights[gauges[i].address] || 0;
  }

  const weightsValid = totalGaugeWeight === 100;

  if (!gauges) {
    return null;
  }

  const renderSelectOptions = (gauge: UserGaugeData) => (
    <Select.Option
      key={gauge.address}
      style={{ color: pickleWhite }}
      value={gauge.depositTokenName}
    >
      {gauge.depositTokenName}
    </Select.Option>
  );

  const compare = (otherArray) => {
    return (current) => {
      return (
        otherArray.filter((other) => {
          return other.address == current.address;
        }).length == 0
      );
    };
  };

  const handleSelect = async (depositTokens: string | string[]) => {
    const selectedFarms = Array.isArray(depositTokens)
      ? depositTokens.map((x) => gauges.find((y) => y.depositTokenName === x))
      : null;

    const absentGauges = gauges.filter(compare(selectedFarms));

    const newVoteWeights = absentGauges.reduce((acc, curr) => {
      return {
        ...acc,
        [curr.address]: 0,
      };
    }, voteWeights);
    setNewWeights(null);
    setVoteWeights(newVoteWeights);
    setVotingFarms(selectedFarms);
  };

  const handleSelectAll = () => {
    handleSelect(gauges.map((gauge) => gauge.depositTokenName));
  };

  const handleBoost = () => {
    const tokens: string[] = [];
    const weights: number[] = [];

    if (!gauges || !weightsValid) return;
    for (let i = 0; i < gauges.length; i++) {
      tokens.push(gauges[i].depositToken.address);
      weights.push(voteWeights[gauges[i].address]);
    }

    return { tokens, weights };
  };

  const calculateNewWeights = () => {
    if (weightsValid) {
      const voteArray = Object.entries(voteWeights).map((e) => ({
        [e[0]]: e[1],
      }));
      const newWeights = voteArray.map((x) => {
        const gaugeAddress = Object.keys(x)[0];
        const gauge = gauges.find((gauge) => gauge.address === gaugeAddress);
        if (gauge && dillBalanceBN) {
          const dillBalance = +dillBalanceBN.toString();
          // Revise user's weight distribution for new estimate
          const estimatedWeight =
            (gauge.gaugeWeight -
              gauge.userWeight +
              (dillBalance * Object.values(x)[0]) / 100) /
            (gauge.totalWeight - gauge.userCurrentWeights + dillBalance);

          return { [gauge.address]: estimatedWeight };
        } else {
          return null;
        }
      });
      setNewWeights(newWeights);
    } else {
      setNewWeights(null);
    }
  };

  const initialize = async () => {
    const newWeights = gauges.map((x) => x.allocPoint);
    if (JSON.stringify(newWeights) != JSON.stringify(currWeights)) {
      const initialWeights = gauges.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.address]: 0,
        };
      }, {});

      const updatedFarms = votingFarms
        ? votingFarms.map((x) => gauges.find((y) => y.address === x.address))
        : null;

      setVoteWeights(initialWeights);
      setVotingFarms(updatedFarms);
      setNewWeights(null);
      setCurrWeights(newWeights);
    }
  };

  useEffect(() => {
    initialize();
  }, [gauges]);

  useEffect(() => {
    calculateNewWeights();
  }, [weightsValid]);

  useEffect(() => {
    if (gaugeProxy) {
      const voteStatus = getTransferStatus("vote", gaugeProxy.address);
      const balance = +dillBalanceBN?.toString();
      const buttonText = balance
        ? weightsValid
          ? t("gauges.submitVote")
          : t("gauges.weightsInvalid")
        : t("gauges.dillNeeded");

      if (voteStatus === ERC20TransferStatus.Transfering) {
        setButtonStatus(
          voteStatus,
          t("gauges.voting"),
          buttonText,
          setVoteButton,
        );
      } else {
        setVoteButton({
          disabled: !balance || !weightsValid,
          text: buttonText,
        });
      }
    }
  }, [transferStatus, weightsValid]);

  const { getUniPairDayAPY } = useUniPairDayData();
  const { jars } = Jars.useContainer();

  const renderVotingOption = (gauge: UserGaugeData) => {
    const {
      poolName,
      depositToken,
      depositTokenName,
      fullApy,
      allocPoint,
      address,
    } = gauge;
    let APYs: JarApy[] = [];

    if (depositToken.address.toLowerCase() === PICKLE_ETH_GAUGE.toLowerCase()) {
      APYs = [...APYs, ...getUniPairDayAPY(PICKLE_ETH_GAUGE)];
    }

    // Get Jar APY (if its from a Jar)
    const pickleAPYMin = fullApy * 100 * 0.4;
    const pickleAPYMax = fullApy * 100;

    const maybeJar =
      JAR_GAUGE_MAP[depositToken.address as keyof typeof JAR_GAUGE_MAP];
    if (jars && maybeJar) {
      const gaugeingJar = jars.filter((x) => x.jarName === maybeJar.jarName)[0];
      APYs = gaugeingJar?.APYs ? [...APYs, ...gaugeingJar.APYs] : APYs;
    }

    const totalAPY = APYs.map((x) => {
      return Object.values(x).reduce((acc, y) => acc + (isNaN(y) ? 0 : y), 0);
    }).reduce((acc, x) => acc + x, 0);

    const newWeightMaybe = newWeights?.find(
      (x: UserGaugeData) => x[address] >= 0,
    );
    const newWeight = newWeightMaybe ? newWeightMaybe[address] : null;

    return (
      <Grid.Container
        style={{ width: "100%", paddingBottom: "10px" }}
        key={address}
      >
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
            <Label style={{ fontSize: `0.85rem` }}>{depositTokenName}</Label>
          </div>
        </Grid>
        <Grid xs={24} sm={6} md={5} lg={5} style={{ textAlign: "center" }}>
          <Data isZero={fullApy === 0}>
            {formatAPY(totalAPY + pickleAPYMin)}~
            {formatAPY(totalAPY + pickleAPYMax)}
          </Data>
          <Label>{t("gauges.totalApyRange")}</Label>
        </Grid>
        <Grid xs={24} sm={6} md={5} lg={5} style={{ textAlign: "center" }}>
          <Data isZero={fullApy === 0}>
            {formatAPY(pickleAPYMin)}~{formatAPY(pickleAPYMax)}
          </Data>
          <Label>{t("gauges.pickleApy")}</Label>
        </Grid>
        <Grid xs={24} sm={6} md={5} lg={5} style={{ textAlign: "center" }}>
          <Data>
            {formatPercent(allocPoint)}%{" "}
            {newWeight ? `-> ${formatPercent(newWeight)}%` : null}
          </Data>
          <Label>{t("gauges.currentWeight")}</Label>
        </Grid>
        <Grid xs={24} sm={6} md={3} lg={3} style={{ textAlign: "center" }}>
          <PercentageInput
            placeholder="0%"
            css={{
              width: "60px !important",
              minWidth: 0,
              margin: "auto",
            }}
            value={voteWeights[address] ? voteWeights[address] : 0}
            onValueChange={async ({ floatValue }) => {
              setVoteWeights({
                ...voteWeights,
                [address]: floatValue,
              });
            }}
          />
        </Grid>
      </Grid.Container>
    );
  };

  return (
    <Collapse
      style={{ borderWidth: "1px", boxShadow: "none", flex: 1 }}
      shadow
      preview={t("gauges.selectFarms")}
    >
      <Spacer y={1} />
      <div style={{ display: "flex" }}>
        <Select
          placeholder={t("gauges.selectBoost")}
          multiple
          width="100%"
          onChange={(value) => handleSelect(value)}
        >
          {gauges.map(renderSelectOptions)}
        </Select>
        <Button
          size="large"
          css={{
            height: "unset !important",
            display: "flex !important",
            alignItems: "center",
            marginLeft: "20px",
            width: "120px !important",
            minWidth: "0 !important",
          }}
          onClick={handleSelectAll}
        >
          {t("gauges.selectAll")}
        </Button>
      </div>
      <Spacer y={0.5} />
      <h3>{t("gauges.selectedFarms")}</h3>
      {votingFarms?.length ? (
        <>
          {votingFarms.map(renderVotingOption)}

          <Spacer y={1} />
          <Grid.Container gap={2}>
            <Grid xs={24} md={24}>
              <span style={{ float: "right" }}>
                {t("gauges.currentAllocation")}: {totalGaugeWeight}%
              </span>
              <Button
                disabled={voteButton.disabled || !weightsValid}
                onClick={() => {
                  const { tokens, weights } = handleBoost();
                  if (gaugeProxy) {
                    let newWeights = [];
                    let newTokens = [];
                    for (var it = 0; it < weights.length; it++) {
                      if (weights[it] !== 0) {
                        newWeights.push(weights[it]);
                        newTokens.push(tokens[it]);
                      }
                    }
                    transfer({
                      token: "vote",
                      recipient: gaugeProxy.address,
                      transferCallback: async () => {
                        return gaugeProxy.connect(signer).vote(
                          newTokens,
                          newWeights.map((weight) =>
                            ethers.BigNumber.from((weight * 100).toFixed(0)),
                          ),
                        );
                      },
                      approval: false,
                    });
                  }
                }}
                style={{ width: "100%" }}
              >
                {voteButton.text}
              </Button>
            </Grid>
          </Grid.Container>
        </>
      ) : (
        t("gauges.selectPrompt")
      )}
    </Collapse>
  );
};

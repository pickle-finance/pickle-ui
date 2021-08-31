import { FC } from "react";
import styled from "styled-components";
import { Grid, Select } from "@geist-ui/react";

import { JAR_DEPOSIT_TOKEN_TO_ICON } from "../Gauges/JarCollapsible";
import { JarWithTVL } from "../../containers/Jars/useJarsWithTVL";

const Option = styled(Select.Option)`
  height: 3rem !important;
  font-size: 1rem !important;
`;

const getIcon = (jar: JarWithTVL) => {
  const addr = jar.depositToken.address;
  const iconSrc = JAR_DEPOSIT_TOKEN_TO_ICON[addr];
  if (!iconSrc) return null;
  return <img src={iconSrc} style={{ width: `24px` }} />;
};

interface IProps {
  jars: JarWithTVL[] | null;
  from: string;
  to: string;
  handleFromSelect: (s: string | string[]) => void;
  handleToSelect: (s: string | string[]) => void;
}

export const JarSelectors: FC<IProps> = ({
  jars,
  from,
  to,
  handleFromSelect,
  handleToSelect,
}) => {
  return (
    <>
      <Grid xs={24} sm={12}>
        <h2>From</h2>
        <Select
          width="100%"
          style={{ height: `3rem`, maxWidth: `unset` }}
          value={from}
          onChange={handleFromSelect}
          multiple={false}
        >
          {jars
            ?.filter((jar) => jar.jarName != to)
            .map((jar) => (
              <Option key={jar.jarName} value={jar.jarName}>
                <div style={{ display: `flex`, alignItems: `center` }}>
                  {getIcon(jar)}
                  <div
                    style={{ paddingLeft: `1rem` }}
                  >{`${jar.jarName} (${jar.depositTokenName})`}</div>
                </div>
              </Option>
            ))}
        </Select>
      </Grid>
      <Grid xs={24} sm={12}>
        <h2>To</h2>
        <Select
          width="100%"
          style={{ height: `3rem`, maxWidth: `unset` }}
          value={to}
          onChange={handleToSelect}
          multiple={false}
        >
          {jars
            ?.filter((jar) => jar.jarName != from)
            .map((jar) => (
              <Option key={jar.jarName} value={jar.jarName}>
                <div style={{ display: `flex`, alignItems: `center` }}>
                  {getIcon(jar)}
                  <div
                    style={{ paddingLeft: `1rem` }}
                  >{`${jar.jarName} (${jar.depositTokenName})`}</div>
                </div>
              </Option>
            ))}
        </Select>
      </Grid>
    </>
  );
};

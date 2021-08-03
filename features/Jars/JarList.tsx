import { FC, useState } from "react";
import { formatEther } from "ethers/lib/utils";
import styled from "styled-components";
import { Spacer, Grid, Checkbox } from "@geist-ui/react";
import { withStyles } from "@material-ui/core/styles";
import Switch from "@material-ui/core/Switch";

import { JarCollapsible } from "./JarCollapsible";
import { BProtocol } from "./BProtocol";
import {
  JAR_ACTIVE,
  JAR_YEARN,
} from "../../containers/Jars/jars";
import { Connection } from "../../containers/Connection";
import { UserJars } from "../../containers/UserJars";
import {
  backgroundColor,
  pickleGreen,
  pickleWhite,
} from "../../util/constants";
import { NETWORK_NAMES } from "containers/config";

const Container = styled.div`
  padding-top: 1.5rem;
`;

const GreenSwitch = withStyles({
  switchBase: {
    color: backgroundColor,
    "&$checked": {
      color: pickleGreen,
    },
    "&$checked + $track": {
      backgroundColor: pickleGreen,
    },
  },
  checked: {},
  track: {},
})(Switch);

export const JarList: FC = () => {
  const { signer, chainName } = Connection.useContainer();
  const { jarData } = UserJars.useContainer();
  const [showInactive, setShowInactive] = useState(false);
  const [showUserJars, setShowUserJars] = useState<boolean>(false);

  if (!signer) {
    return <h2>Please connect wallet to continue</h2>;
  }

  if (jarData === null) {
    if (chainName === NETWORK_NAMES.POLY) {
      return (
        <>
          <h2>Loading...</h2>
          <span style={{ color: pickleWhite }}>
            If you have been waiting more than a few seconds, you may be
            rate-limited. Consider changing to a different Polygon RPC such as
            'https://matic-mainnet.chainstacklabs.com/' or
            'https://rpc-mainnet.matic.network' or
            'https://rpc-mainnet.maticvigil.com'
          </span>
        </>
      );
    } else {
      return <h2>Loading...</h2>;
    }
  }

  const activeJars = jarData
    .filter(
      (jar) =>
        JAR_ACTIVE[jar.depositTokenName] && !JAR_YEARN[jar.depositTokenName],
    )
    .sort((a, b) => b.totalAPY - a.totalAPY);

  const yearnJars = jarData.filter(
    (jar) =>
      JAR_ACTIVE[jar.depositTokenName] && JAR_YEARN[jar.depositTokenName],
  );
  const inactiveJars = jarData.filter(
    (jar) => !JAR_ACTIVE[jar.depositTokenName],
  );

  const userJars = jarData.filter((jar) =>
    parseFloat(formatEther(jar.deposited)),
  );
  return (
    <Container>
      <Grid.Container gap={1}>
        <Grid md={12}>
          <p>
            Put your tokens into a PickleJar and earn without losing your
            principal.
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            color="green"
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            Show Inactive Jars
          </Checkbox>{" "}
          <GreenSwitch
            style={{ top: "-2px" }}
            checked={showUserJars}
            onChange={() => setShowUserJars(!showUserJars)}
          />
          Show Your Jars
        </Grid>
        {chainName === NETWORK_NAMES.ETH && (
          <>
            Powered by&nbsp;
            <a href="https://yearn.finance/" target="_">
              Yearn
            </a>
            &nbsp;⚡
            {yearnJars.map((jar, idx) => (
              <Grid xs={24} key={jar.name}>
                <JarCollapsible jarData={jar} isYearnJar={true} />
                {idx === yearnJars.length - 1 && <Spacer y={1} />}
              </Grid>
            ))}
          </>
        )}
        {chainName === NETWORK_NAMES.ETH && (
          <>
            Powered by&nbsp;
            <a href="https://bprotocol.org/" target="_">
              B.Protocol
            </a>
            &nbsp;⚡
            <Grid xs={24}>
              <BProtocol />
              <Spacer y={1} />
            </Grid>
          </>
        )}
      </Grid.Container>
      <Grid.Container gap={1}>
        {(showUserJars ? userJars : activeJars).map((jar) => (
          <Grid xs={24} key={jar.name}>
            <JarCollapsible jarData={jar} />
          </Grid>
        ))}
      </Grid.Container>

      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>Inactive</h2>}
        {showInactive &&
          inactiveJars.map((jar) => (
            <Grid xs={24} key={jar.name}>
              <JarCollapsible jarData={jar} />
            </Grid>
          ))}
      </Grid.Container>
    </Container>
  );
};

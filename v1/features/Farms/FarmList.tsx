import { FC, useState } from "react";
import styled from "styled-components";
import { Spacer, Grid, Checkbox, Button } from "@geist-ui/react";
import { useTranslation } from "next-i18next";

import { FarmCollapsible } from "./FarmCollapsible";
import { UserFarms, UserFarmData } from "../../containers/UserFarms";
import { Connection } from "../../containers/Connection";
import { isYveCrvEthJarToken } from "../../containers/Jars/jars";
import { ChainNetwork } from "picklefinance-core";

const Container = styled.div`
  padding-top: 1.5rem;
`;

export const FarmList: FC = () => {
  const { signer, chainName } = Connection.useContainer();
  const { farmData } = UserFarms.useContainer();
  const [showInactive, setShowInactive] = useState<boolean>(
    chainName === ChainNetwork.Polygon ? false : true,
  );
  const { t } = useTranslation("common");

  if (!signer) return <h2>{t("connection.connectToContinue")}</h2>;

  if (!farmData && chainName !== ChainNetwork.Polygon) {
    return <h2>{t("connection.loading")}</h2>;
  }

  const activeFarms = farmData.filter((x) => x.apy !== 0);
  const inactiveFarms = farmData.filter((x) => x.apy === 0);

  const indexofYvecrv = inactiveFarms.findIndex((x) => isYveCrvEthJarToken(x.depositToken.address));

  const moveInArray = (arr: UserFarmData[], from: number, to: number) => {
    var item = arr.splice(from, 1);

    if (!item.length) return;
    arr.splice(to, 0, item[0]);
  };

  moveInArray(inactiveFarms, indexofYvecrv, 1);
  return (
    <Container>
      <Grid.Container gap={1}>
        <Grid md={12}>
          <p>
            {t("farms.about")}
            <br />
            {t("farms.apy")}
          </p>
        </Grid>
        <Grid md={12} style={{ textAlign: "right" }}>
          <Checkbox
            checked={showInactive}
            size="medium"
            onChange={(e) => setShowInactive(e.target.checked)}
          >
            {t("farms.showInactive")}
          </Checkbox>
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
      <Grid.Container gap={1}>
        {activeFarms.map((farmData) => (
          <>
            <Grid xs={24} key={farmData.poolIndex}>
              <FarmCollapsible farmData={farmData} />
            </Grid>
          </>
        ))}
      </Grid.Container>
      <Spacer y={1} />
      <Grid.Container gap={1}>
        {showInactive && <h2>{t("farms.inactive")}</h2>}
        {showInactive &&
          inactiveFarms.map((farmData) => (
            <Grid xs={24} key={farmData.poolIndex}>
              <FarmCollapsible farmData={farmData} />
            </Grid>
          ))}
      </Grid.Container>
    </Container>
  );
};

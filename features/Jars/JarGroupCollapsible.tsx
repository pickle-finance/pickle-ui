import FlexBox from "../../components/FlexBox";
import { FC, useEffect, useState } from "react";
import BigNumber from "bignumber.js";
import { Grid } from "@geist-ui/react";
import Collapse from "../Collapsible/Collapse";
import { DEPOSIT_TOKENS_API_NAME } from "../../containers/Jars/jargroups";

import { JarCollapsible, JAR_DEPOSIT_TOKEN_TO_ICON } from "./JarCollapsible";
import { UserJarData } from "../../containers/UserJars";
import { TokenIcon } from "../../components/TokenIcon";
import { getProtocolData } from "../../util/api";

const renderCategoryLogo = (category: string) => {
  switch (category.toLowerCase()) {
    case "sushiswap":
      return (
        <img
          style={{ height: "30px", paddingLeft: "5px" }}
          src="/sushiswap.png"
        ></img>
      );
    case "uniswap":
      return (
        <img
          style={{ height: "30px", paddingLeft: "5px" }}
          src="/uniswap.png"
        ></img>
      );
    case "curve":
      return (
        <img
          style={{ height: "30px", paddingLeft: "5px" }}
          src="/crv.png"
        ></img>
      );
  }
};

export const BeautifyValue = (value: number) => {
  if (value > 1000000) return `${Number(value / 1000000).toFixed(2)}M`;
  else if (value > 1000) return `${Number(value / 1000).toFixed(2)}K`;
  return value;
};
export const JarGroupCollapsible: FC<{
  jarData: UserJarData[];
  category: string;
}> = ({ jarData, category }) => {
  const [totalDeposited, setTotalDeposited] = useState(0);
  const maxApy = Math.max(...jarData.map((jar) => jar.totalAPY)).toFixed(0);
  const minApy = Math.min(
    ...jarData.filter((jar) => jar.totalAPY).map((jar) => jar.totalAPY),
  ).toFixed(0);

  useEffect(() => {
    getProtocolData(false).then((res) => {
      const deposited: number[] = jarData.map(
        (jar) =>
          (res as any)[
            (DEPOSIT_TOKENS_API_NAME as any)[jar.depositToken.address]
          ],
      );
      const totalDeposited = deposited.reduce((a, b) => a + b, 0);
      setTotalDeposited(totalDeposited);
    });
  }, []);

  return (
    <Collapse
      shadow
      group
      preview={
        <Grid.Container>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <FlexBox alignItems="center">
              <strong>{category}</strong>
              {renderCategoryLogo(category)}
            </FlexBox>
          </Grid>
          <Grid xs={24} sm={12} md={12} lg={12}>
            <Grid.Container>
              {jarData.map((jar) => (
                <Grid xs={8}>
                  <FlexBox
                    style={{ marginBottom: 8, marginRight: 10 }}
                    alignItems="center"
                  >
                    <TokenIcon
                      size="sm"
                      src={
                        JAR_DEPOSIT_TOKEN_TO_ICON[
                          jar.depositToken
                            .address as keyof typeof JAR_DEPOSIT_TOKEN_TO_ICON
                        ]
                      }
                    />
                    <div
                      style={{
                        fontSize: 14,
                      }}
                    >
                      {jar.depositTokenName}
                    </div>
                  </FlexBox>
                </Grid>
              ))}
            </Grid.Container>
          </Grid>

          <Grid xs={24} sm={12} md={7} lg={7}>
            <FlexBox
              flexDirection="column"
              gap={20}
              alignItems="flex-end"
              style={{
                paddingRight: "2rem",
              }}
            >
              <div>
                <span>APY: </span>
                <b>
                  {minApy}% - {maxApy}%
                </b>
              </div>
              <div>
                <span>Deposited: </span>
                <b>{BeautifyValue(totalDeposited)}</b>
              </div>
            </FlexBox>
          </Grid>
        </Grid.Container>
      }
    >
      {jarData.map((jar) => (
        <Grid xs={24} key={jar.name}>
          <JarCollapsible jarData={jar} />
        </Grid>
      ))}
    </Collapse>
  );
};

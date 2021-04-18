import FlexBox from "../../components/FlexBox";
import { FC, useEffect, useState } from "react";
import { Grid } from "@geist-ui/react";
import Collapse from "../Collapsible/Collapse";

import { FarmCollapsible, FARM_LP_TO_ICON } from "./FarmCollapsible";
import { TokenIcon } from "../../components/TokenIcon";
import { getProtocolData } from "../../util/api";
import { UserFarmData } from "../../containers/UserFarms";

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

export const FarmGroupCollapsible: FC<{
  farmData: UserFarmData[];
  category: string;
}> = ({ farmData, category }) => {
  return (
    <Collapse
      shadow
      group
      preview={
        <Grid.Container>
          <Grid xs={24} sm={12} md={6} lg={6}>
            <FlexBox alignItems="center">
              <strong>{category}</strong>
              {renderCategoryLogo(category)}
            </FlexBox>
          </Grid>
          <Grid xs={24} sm={12} md={18} lg={18}>
            <Grid.Container>
              {farmData.map((farm) => (
                <Grid xs={8}>
                  <FlexBox
                    style={{ marginBottom: 8, marginRight: 10 }}
                    alignItems="center"
                  >
                    <TokenIcon
                      size="sm"
                      src={
                        FARM_LP_TO_ICON[
                          farm.depositToken
                            .address as keyof typeof FARM_LP_TO_ICON
                        ]
                      }
                    />
                    <div
                      style={{
                        fontSize: 14,
                      }}
                    >
                      {farm.depositTokenName}
                    </div>
                  </FlexBox>
                </Grid>
              ))}
            </Grid.Container>
          </Grid>
        </Grid.Container>
      }
    >
      {farmData.map((farm) => (
        <Grid xs={24} key={farm.poolIndex}>
          <FarmCollapsible farmData={farm} />
        </Grid>
      ))}
    </Collapse>
  );
};

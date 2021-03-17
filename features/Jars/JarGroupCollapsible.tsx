import { ethers } from "ethers";
import styled from "styled-components";

import { useState, FC, useEffect, ReactNode } from "react";
import { Grid, Tooltip } from "@geist-ui/react";
import Collapse from "../Collapsible/Collapse";

import { JarCollapsible, JAR_DEPOSIT_TOKEN_TO_ICON } from "./JarCollapsible";
import { UserJarData } from "../../containers/UserJars";

export const JarGroupCollapsible: FC<{
  jarData: UserJarData[];
  category: string;
}> = ({ jarData, category }) => {
  console.log("jarData", jarData);
  return (
    <Collapse
      style={{ marginBottom: "10px", width: "100%" }}
      preview={
        <Grid.Container>
          <Grid xs={24} sm={12} md={5} lg={5}>
            <strong>{category}</strong>
            {category.toLowerCase() === "sushiswap" ? (
              <img
                style={{ height: "30px", paddingLeft: "5px" }}
                src="/sushiswap.png"
              ></img>
            ) : null}
          </Grid>
          <Grid xs={24} sm={12} md={12} lg={12}>
            <Grid.Container>
              {jarData.map((jar) => (
                <Grid xs={8}>
                  <div
                    style={{
                      float: "left",
                      margin: "auto 0",
                      marginRight: "1rem",
                      minHeight: 0,
                      display: "flex",
                    }}
                  >
                    {jar.depositTokenName}
                  </div>
                </Grid>
              ))}
            </Grid.Container>
          </Grid>

          <Grid
            xs={24}
            sm={12}
            md={7}
            lg={7}
            style={{
              justifyContent: "flex-end",
              display: "flex",
              paddingRight: "2rem",
            }}
          >
            APY: <strong>9%-53%</strong>
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

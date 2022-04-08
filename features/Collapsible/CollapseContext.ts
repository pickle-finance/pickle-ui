import React from "react";

export interface CollapseConfig {
  values: Array<number>;
  // eslint-disable-next-line
  updateValues?: Function;
}

const defaultContext = {
  values: [],
};

export const CollapseContext = React.createContext<CollapseConfig>(defaultContext);

export const useCollapseContext = (): CollapseConfig =>
  React.useContext<CollapseConfig>(CollapseContext);

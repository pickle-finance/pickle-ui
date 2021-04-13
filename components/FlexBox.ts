import styled, { css } from "styled-components";

interface FlexBoxProps {
  alignContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "stretch";
  col?: number;
  gap?: number;
  alignItems?: "stretch" | "flex-start" | "flex-end" | "center" | "baseline";
  display?: "inline-flex" | "flex";
  flexDirection?: "row" | "row-reverse" | "column" | "column-reverse";
  flexFlow?: string | null | undefined;
  flexWrap?: "nowrap" | "wrap" | "wrap-reverse";
  width?: string;
  justifyContent?:
    | "flex-start"
    | "flex-end"
    | "center"
    | "space-between"
    | "space-around"
    | "space-evenly";
}
const FlexBox = styled.div<FlexBoxProps>`
  align-content: ${({ alignContent }) => alignContent};
  align-items: ${({ alignItems }) => alignItems};
  display: ${({ display }) => display};
  flex-direction: ${({ flexDirection }) => flexDirection};
  ${({ flexFlow, flexWrap }) =>
    !flexFlow &&
    flexWrap &&
    css`
      flex-wrap: ${({ flexWrap }) => flexWrap};
    `}
  ${({ flexFlow }) =>
    flexFlow &&
    css`
      flex-flow: ${flexFlow};
    `}
  justify-content: ${({ justifyContent }) => justifyContent};
  width: ${({ width }) => width};
  & > div {
    ${({ col, gap, flexDirection }) =>
      gap &&
      (flexDirection === "row" || flexDirection === "row-reverse"
        ? !col
          ? css`
              &:not(:last-child) {
                margin-right: ${gap}px;
              }
            `
          : css`
              &:not(:nth-child(${col}n)) {
                margin-right: ${gap}px;
              }
            `
        : css`
            &:not(:last-child) {
              margin-bottom: ${gap}px !important;
            }
          `)}
    ${({ col, gap }) =>
      col &&
      css`
        flex: 1 0 calc((100% - ${(col - 1) * (gap ? gap : 0)}px) / ${col});
        max-width: calc((100% - ${(col - 1) * (gap ? gap : 0)}px) / ${col});
      `}
  }
`;

FlexBox.propTypes = {};

FlexBox.defaultProps = {
  alignContent: "stretch",
  alignItems: "stretch",
  display: "flex",
  flexDirection: "row",
  flexFlow: null,
  justifyContent: "flex-start",
  width: "auto",
};

export default FlexBox;

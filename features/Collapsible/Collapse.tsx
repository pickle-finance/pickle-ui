import React, { useEffect } from "react";
import { useTheme, useCurrentState } from "@geist-ui/react";
import { useCollapseContext } from "./CollapseContext";
import CollapseGroup from "@geist-ui/react/dist/collapse/collapse-group";
import Expand from "./Expand";
import CollapseIcon from "./CollapseIcon";
import styled, { css } from "styled-components";

interface Props {
  preview: React.ReactNode | string;
  initialVisible?: boolean;
  shadow?: boolean;
  index?: number;
  group?: boolean;
}

const defaultProps = {
  shadow: false,
  initialVisible: false,
};

// eslint-disable-next-line
type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>;
export type CollapseProps = Props & typeof defaultProps & NativeAttrs;

const StyledCollapse = styled.div`
  position: relative;
  overflow: hidden;
  width: 100%;
  ${({ group }) =>
    group
      ? css`
          padding: 8px;
          margin: 10px 0;
        `
      : css`
          padding: ${({ theme }) => theme.layout.gap} 0;
          background-color: #1f1f1f;
          margin-bottom: 8px;
        `}
  ${({ shadow }) =>
    shadow &&
    css`
      box-shadow: var(--accent-glow-color) 0 0 6px 0;
      border: 2px solid var(--accent-color);
      border-radius: ${({ theme }) => theme.layout.radius};
      padding: ${({ theme }) => theme.layout.gap};
    `}
  .logo {
    position: absolute;
    right: 50px;
    bottom: -25px;
    z-index: -1;
    opacity: 0.2;
  }
  .view {
    cursor: pointer;
    outline: none;
  }
  .trigger {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--body-color);
  }
  .preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--body-color);
    margin: 0;
  }
  .preview > :global(*) {
    margin: 0;
  }
  .content {
    font-size: 1rem;
    line-height: 1.625rem;
  }
  .content > :global(*:first-child) {
    margin-top: 0;
  }
  .content > :global(*:last-child) {
    margin-bottom: 0;
  }
`;
const Collapse: React.FC<React.PropsWithChildren<CollapseProps>> = ({
  children,
  preview,
  initialVisible,
  shadow,
  index,
  group,
  ...props
}) => {
  const theme = useTheme();
  const [visible, setVisible, visibleRef] = useCurrentState<boolean>(
    initialVisible,
  );
  const { values, updateValues } = useCollapseContext();

  useEffect(() => {
    if (!values.length) return;
    const isActive = !!values.find((item) => item === index);
    setVisible(isActive);
  }, [values.join(",")]);

  const clickHandler = () => {
    const next = !visibleRef.current;
    setVisible(next);
    updateValues && updateValues(index, next);
  };

  return (
    <StyledCollapse shadow={shadow} theme={theme} group={group} {...props}>
      {group && <img src="pickle.png" alt="logo" className="logo" />}
      <div className="view" role="button" onClick={clickHandler}>
        <div className="preview">
          {preview}
          <CollapseIcon active={visible} />
        </div>
      </div>
      <Expand isExpanded={visible}>
        <div className="content">{children}</div>
      </Expand>
    </StyledCollapse>
  );
};

Collapse.defaultProps = defaultProps;

// eslint-disable-next-line
type CollapseComponent<P = {}> = React.FC<P> & {
  Group: typeof CollapseGroup;
};

type ComponentProps = Partial<typeof defaultProps> &
  Omit<Props, keyof typeof defaultProps> &
  NativeAttrs;

export default Collapse as CollapseComponent<ComponentProps>;

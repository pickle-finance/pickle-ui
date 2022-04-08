import React, { useEffect } from "react";
import { useTheme, useCurrentState } from "@geist-ui/react";
import { useCollapseContext } from "./CollapseContext";
import CollapseGroup from "@geist-ui/react/dist/collapse/collapse-group";
import Expand from "./Expand";
import CollapseIcon from "./CollapseIcon";

interface Props {
  preview: React.ReactNode | string;
  initialVisible?: boolean;
  shadow?: boolean;
  className?: string;
  index?: number;
}

const defaultProps = {
  className: "",
  shadow: false,
  initialVisible: false,
};

// eslint-disable-next-line
type NativeAttrs = Omit<React.HTMLAttributes<any>, keyof Props>;
export type CollapseProps = Props & typeof defaultProps & NativeAttrs;

const Collapse: React.FC<React.PropsWithChildren<CollapseProps>> = ({
  children,
  preview,
  initialVisible,
  shadow,
  className,
  index,
  ...props
}) => {
  const theme = useTheme();
  const [visible, setVisible, visibleRef] = useCurrentState<boolean>(initialVisible);
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
    <div className={`collapse ${shadow ? "shadow" : ""} ${className}`} {...props}>
      <div className="view" role="button" onClick={clickHandler}>
        <div className="preview">
          {preview}
          <CollapseIcon active={visible} />
        </div>
      </div>
      <Expand isExpanded={visible}>
        <div className="content">{children}</div>
      </Expand>
      <style jsx>{`
        .collapse {
          padding: ${theme.layout.gap} 0;
          border-top: 1px solid var(--accent-color);
          border-bottom: 1px solid var(--accent-color);
        }
        .shadow {
          box-shadow: var(--accent-glow-color) 0 0 6px 0;
          border: 2px solid var(--accent-color);
          border-radius: ${theme.layout.radius};
          padding: ${theme.layout.gap};
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
          padding: ${theme.layout.gap} 0;
        }
        .content > :global(*:first-child) {
          margin-top: 0;
        }
        .content > :global(*:last-child) {
          margin-bottom: 0;
        }
      `}</style>
    </div>
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

import React from "react";

interface Props {
  active?: boolean;
}

const CollapseIcon: React.FC<Props> = ({ active }) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      shapeRendering="geometricPrecision"
      style={{ color: "white" }}
    >
      <path d="M6 9l6 6 6-6" />

      <style jsx>{`
        svg {
          transition: transform 200ms ease;
          transform: rotateZ(${active ? "-180deg" : "0"});
        }
      `}</style>
    </svg>
  );
};

const MemoCollapseIcon = React.memo(CollapseIcon);

export default MemoCollapseIcon;

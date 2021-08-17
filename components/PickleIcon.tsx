import { FC } from "react";

interface Props {
  size: number;
  margin?: number | string;
}

const PickleIcon: FC<Props> = ({ size, margin = 0 }) => (
  <img
    src="/pickle.png"
    alt="pickle"
    style={{
      width: size,
      margin,
      verticalAlign: `text-bottom`,
    }}
  />
);

export default PickleIcon;

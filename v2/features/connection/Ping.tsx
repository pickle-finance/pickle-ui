import { FC } from "react";

const Ping: FC = () => (
  <div className="inline-flex relative h-3 w-3 mx-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-light opacity-75" />
    <span className="relative inline-flex rounded-full h-3 w-3 bg-accent opacity-90" />
  </div>
);

export default Ping;

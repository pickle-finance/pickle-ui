import { VFC } from "react";
import { useIntervalWhen } from "rooks";

import { useAppDispatch } from "v2/store";
import { fetchCore } from "v2/store/core";

const refreshInterval = 5 * 60 * 1000;

const CoreProvider: VFC = () => {
  const dispatch = useAppDispatch();

  useIntervalWhen(() => dispatch(fetchCore()), refreshInterval, true, true);

  return null;
};

export default CoreProvider;

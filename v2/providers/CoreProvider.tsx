import { FC, useEffect } from "react";

import { useAppDispatch } from "v2/store";
import { fetchCore } from "v2/store/core";

const CoreProvider: FC = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCore());
  }, []);

  return <>{children}</>;
};

export default CoreProvider;

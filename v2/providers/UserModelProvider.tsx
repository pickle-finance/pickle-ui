import { FC, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { UserModel, IUserModelCallback } from "picklefinance-core/lib/client/UserModel";
import { useIntervalWhen } from "rooks";

import { CoreSelectors } from "v2/store/core";
import { useAppDispatch } from "v2/store";
import { setData, setIsFetching } from "v2/store/user";

const refreshInterval = 1.5 * 60 * 1000;

const UserModelProvider: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const core = useSelector(CoreSelectors.selectCore);
  const timestamp = useSelector(CoreSelectors.selectTimestamp);
  const { account } = useWeb3React<Web3Provider>();

  const refreshUserModel = useCallback(async () => {
    if (!core || !account) return;

    dispatch(setIsFetching(true));

    const callback: IUserModelCallback = {
      async modelUpdated(data) {
        dispatch(setData({ data, type: "incremental" }));
      },
      async modelFinished(data) {
        dispatch(setData({ data, type: "final" }));
        dispatch(setIsFetching(false));
      },
    };

    try {
      const user = new UserModel(core, account, new Map(), callback);
      await user.generateUserModel();
    } catch (error) {
      dispatch(setIsFetching(false));
    }
  }, [core, account]);

  useEffect(() => {
    refreshUserModel();
  }, [timestamp, account]);

  useIntervalWhen(
    refreshUserModel,
    refreshInterval,
    typeof timestamp === "number" && timestamp + refreshInterval < Date.now(),
    false,
  );

  return <>{children}</>;
};

export default UserModelProvider;

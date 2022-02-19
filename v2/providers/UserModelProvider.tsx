import { FC, useEffect } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { UserModel } from "picklefinance-core/lib/client/UserModel";

import { CoreSelectors } from "v2/store/core";
import { useAppDispatch } from "v2/store";
import { setData, setIsFetching } from "v2/store/user";

const UserModelProvider: FC = ({ children }) => {
  const dispatch = useAppDispatch();
  const core = useSelector(CoreSelectors.selectCore);
  const timestamp = useSelector(CoreSelectors.selectTimestamp);
  const { account } = useWeb3React<Web3Provider>();

  useEffect(() => {
    // If there is no core data, there is no timestamp either
    if (!timestamp || !core || !account) return;

    const refreshUserModel = async () => {
      dispatch(setIsFetching(true));

      const user = new UserModel(core, account, new Map());

      user
        .generateUserModel()
        .then((data) => {
          dispatch(setData(data));
          dispatch(setIsFetching(false));
        })
        .catch(() => {
          dispatch(setIsFetching(false));
        });
    };

    refreshUserModel();
  }, [timestamp, account]);

  return <>{children}</>;
};

export default UserModelProvider;

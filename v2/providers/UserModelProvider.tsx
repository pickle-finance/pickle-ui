import { useEffect, VFC } from "react";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { UserModel, IUserModelCallback } from "picklefinance-core/lib/client/UserModel";
import { useIntervalWhen } from "rooks";
import { ChainNetwork } from "picklefinance-core";
import { Signer } from "ethers";

import { CoreSelectors } from "v2/store/core";
import { useAppDispatch, useAppSelector } from "v2/store";
import { UserActions, UserSelectors } from "v2/store/user";
import { useAccount } from "v2/hooks";

const refreshInterval = 3 * 60 * 1000;

const UserModelProvider: VFC = () => {
  const dispatch = useAppDispatch();
  const core = useAppSelector(CoreSelectors.selectCore);
  const coreTimestamp = useAppSelector(CoreSelectors.selectTimestamp);
  const { chainId, library } = useWeb3React<Web3Provider>();
  const account = useAccount();
  const nonce = useAppSelector(UserSelectors.selectNonce);
  const updatedAt = useAppSelector((state) => UserSelectors.selectUpdatedAt(state, account));

  interface Options {
    type: "full" | "minimal";
  }

  const refreshUserModel = async ({ type }: Options) => {
    if (!core || !account) return;

    const callback: IUserModelCallback = {
      async modelUpdated(data) {
        dispatch(
          UserActions.setData({
            account,
            data,
            type: "incremental",
          }),
        );
      },
      async modelFinished(data) {
        if (type === "full") {
          dispatch(
            UserActions.setData({
              account,
              data,
              type: "final",
            }),
          );
        } else if (type === "minimal") {
          dispatch(UserActions.setTokens({ account, data }));
        }
        dispatch(UserActions.setIsFetching(false));
      },
    };

    try {
      const chainName = core?.chains.find((chain) => chain.chainId === chainId)?.network;

      if (!chainName || !library) return;

      const map: Map<ChainNetwork, Signer> = new Map();
      map.set(chainName as ChainNetwork, library.getSigner());

      const user = new UserModel(core, account, map, callback);

      dispatch(UserActions.setIsFetching(true));

      if (type === "full") {
        await user.generateUserModel();
      } else if (type === "minimal") {
        user.setChainsToRun([chainName as ChainNetwork]);
        await user.generateMinimalModel();
      }
    } catch (error) {
      dispatch(UserActions.setIsFetching(false));
    }
  };

  useEffect(() => {
    refreshUserModel({ type: "full" });
  }, [coreTimestamp, account, library]);

  useEffect(() => {
    refreshUserModel({ type: "minimal" });
  }, [nonce]);

  useIntervalWhen(
    () => refreshUserModel({ type: "full" }),
    refreshInterval,
    typeof updatedAt === "number",
    false,
  );

  return null;
};

export default UserModelProvider;

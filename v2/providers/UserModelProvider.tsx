import { useEffect, VFC } from "react";
import { useSelector } from "react-redux";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { UserModel, IUserModelCallback } from "picklefinance-core/lib/client/UserModel";
import { useIntervalWhen } from "rooks";
import { ChainNetwork } from "picklefinance-core";
import { Signer } from "ethers";
import dayjs from "dayjs";

import { CoreSelectors } from "v2/store/core";
import { useAppDispatch } from "v2/store";
import { UserActions, UserSelectors } from "v2/store/user";

const refreshInterval = 60 * 1000;

const UserModelProvider: VFC = () => {
  const dispatch = useAppDispatch();
  const core = useSelector(CoreSelectors.selectCore);
  const coreTimestamp = useSelector(CoreSelectors.selectTimestamp);
  const { account, chainId, library } = useWeb3React<Web3Provider>();
  const nonce = useSelector(UserSelectors.selectNonce);
  const updatedAt = useSelector(UserSelectors.selectUpdatedAt);

  interface Options {
    type: "full" | "minimal";
  }

  const refreshUserModel = async ({ type }: Options) => {
    if (!core || !account) return;

    const callback: IUserModelCallback = {
      async modelUpdated(data) {
        dispatch(UserActions.setData({ data, type: "incremental" }));
      },
      async modelFinished(data) {
        if (type === "full") {
          dispatch(UserActions.setData({ data, type: "final" }));
        } else if (type === "minimal") {
          dispatch(UserActions.setTokenData(data));
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
  }, [coreTimestamp, account]);

  useEffect(() => {
    refreshUserModel({ type: "minimal" });
  }, [nonce]);

  useIntervalWhen(
    () => refreshUserModel({ type: "full" }),
    refreshInterval,
    // Only update if user model is stale.
    typeof updatedAt === "number" && dayjs(updatedAt).isBefore(dayjs().subtract(60, "seconds")),
    false,
  );

  return null;
};

export default UserModelProvider;

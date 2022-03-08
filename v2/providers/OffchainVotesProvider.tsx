import { FC, useEffect } from "react";

import { useAppDispatch } from "v2/store";
import { fetchOffchainVoteData } from "v2/store/offchainVotes";

const OffchainVotesProvider: FC = ({ children }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchOffchainVoteData());
  }, []);

  return <>{children}</>;
};

export default OffchainVotesProvider;

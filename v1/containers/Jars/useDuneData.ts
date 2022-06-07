import { useEffect, useState } from "react";

const body = {
  operationName: "FindResultDataByResult",
  query:
    "query FindResultDataByResult($result_id: uuid!) {\n  query_results(where: {id: {_eq: $result_id}}) {\n    id\n    job_id\n    error\n    runtime\n    generated_at\n    columns\n    __typename\n  }\n  get_result_by_result_id(args: {want_result_id: $result_id}) {\n    data\n    __typename\n  }\n}\n",
  variables: { result_id: "90b9cec0-c576-4f87-b5e3-770ceaa99e45" },
};
const DUNE_API = "https://core-hsr.duneanalytics.com/v1/graphql";

export const useDuneData = () => {
  const [duneData, setDuneData] = useState(null);

  useEffect(() => {
    const fetchYearnData = async () =>
      setDuneData(
        await fetch(DUNE_API, {
          body: JSON.stringify(body),
          method: "POST",
          mode: "cors",
        }).then((x) => x.json()),
      );
    fetchYearnData();
  }, []);

  return {
    duneData,
  };
};

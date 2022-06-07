import { Web3Provider } from "@ethersproject/providers";
import { Contract, BigNumber } from "ethers";
import { toast, ToastOptions } from "react-toastify";
import { PickleModelJson } from "picklefinance-core";
import gaugeProxyAbi from "../../../v1/containers/ABIs/gauge-proxy.json";
import { findJar } from "v2/store/core.helpers";

const GAUGE_PROXY = "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f";

const castVoteMainnet = (
  provider: Web3Provider | undefined,
  selectedJars: string[],
  core: PickleModelJson.PickleModelJson | undefined,
): void => {
  const newTokens: string[] = [];
  const newWeights: BigNumber[] = [];

  selectedJars.forEach((jar) => {
    const jarFromPfcore = findJar(jar, core);
    const jarContract = jarFromPfcore ? jarFromPfcore?.contract : "";
    if (jarContract === "") toast.error(`Unable to locate address of ${jar}.`, toastSettings);
    const inputElement = document.getElementById(jar) as HTMLInputElement;
    const voteWeight = +inputElement.value;

    newTokens.push(jarContract);
    newWeights.push(BigNumber.from((voteWeight * 100).toFixed(0)));
  });
  if (sumVotes(selectedJars) !== 100) {
    // console.log(`Sum of jar vote values (${sumVotes(selectedJars)}) is not equal to 100`);
    toast.error(`Sum of Jar Vote Values (${sumVotes(selectedJars)}) Must Equal 100`, toastSettings);
  } else {
    sendRequestToDillVoter(newTokens, newWeights, provider);
  }
};

const sendRequestToDillVoter = async (
  newTokens: string[],
  newWeights: BigNumber[],
  provider: Web3Provider | undefined,
): Promise<void> => {
  try {
    if (provider) {
      await new Contract(GAUGE_PROXY, gaugeProxyAbi, provider.getSigner())
        .vote(newTokens, newWeights)
        .then(toast.info("Please approve transaction via your wallet.", toastSettings));
    }
  } catch (err) {
    const errMsg = JSON.stringify(err);
    console.log(errMsg);
    toast.error("Error Occured. See console for more details.", toastSettings);
  }
};

const sumVotes = (selected: string[]): number => {
  let sum = 0;
  selected.forEach((s) => {
    const inputElement = document.getElementById(s) as HTMLInputElement;
    if (+inputElement.value < 0) sum += +inputElement.value * -1;
    else sum += +inputElement.value;
  });
  return sum;
};

const toastSettings: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

export default castVoteMainnet;

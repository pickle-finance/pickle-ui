import { Web3Provider } from "@ethersproject/providers";
import { Contract, BigNumber } from "ethers";
import { toast, ToastOptions } from "react-toastify";
import { PickleModelJson } from "picklefinance-core";
<<<<<<< HEAD:v2/features/dill/vote/CastVoteMainnet.tsx
import gaugeProxyAbi from "../../../../containers/ABIs/gauge-proxy.json"
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";

=======
import gaugeProxyAbi from "../../../../../containers/ABIs/gauge-proxy.json";
import { JarDefinition } from "picklefinance-core/lib/model/PickleModelJson";
>>>>>>> d020fbb (platform charts functional and displaying data):v2/features/dill/vote/mainnet/CastVoteMainnet.tsx

const GAUGE_PROXY = "0x2e57627ACf6c1812F99e274d0ac61B786c19E74f";

const castVote = (
  provider: Web3Provider | undefined,
  selectedJars: string[],
<<<<<<< HEAD:v2/features/dill/vote/CastVoteMainnet.tsx
  core: PickleModelJson.PickleModelJson | undefined
=======
  core: PickleModelJson.PickleModelJson | undefined,
>>>>>>> d020fbb (platform charts functional and displaying data):v2/features/dill/vote/mainnet/CastVoteMainnet.tsx
): void => {
  const newTokens: string[] = [];
  const newWeights: BigNumber[] = [];

  selectedJars.forEach((jar) => {
<<<<<<< HEAD:v2/features/dill/vote/CastVoteMainnet.tsx
    const jarFromPfcore: JarDefinition | undefined = core ? core.assets.jars.find(j => j.details.apiKey === jar) : undefined;
    const jarContract = jarFromPfcore ? jarFromPfcore?.contract : "";
=======
    const jarFromPfcore: JarDefinition = core
      ? core.assets.jars.find((j) => j.details.apiKey === jar) || ({} as JarDefinition)
      : ({} as JarDefinition);
    const jarContract = jarFromPfcore.contract || "";
>>>>>>> d020fbb (platform charts functional and displaying data):v2/features/dill/vote/mainnet/CastVoteMainnet.tsx
    if (jarContract === "")
      toast.error(`Unable to locate address of ${jar}.`, toastSettings);
    const inputElement = document.getElementById(jar) as HTMLInputElement;
    const voteWeight = +inputElement.value;

    newTokens.push(jarContract);
    newWeights.push(BigNumber.from((voteWeight * 100).toFixed(0)));
  });
  if (sumVotes(selectedJars) !== 100) {
    console.log(`Sum of jar vote absolute values (${sumVotes(selectedJars)}) is not equal to 100`);
    toast.error("Sum of Jar Vote Absolute Values Must Equal 100", toastSettings);
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

export default castVote;

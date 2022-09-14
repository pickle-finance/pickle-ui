import { Web3Provider } from "@ethersproject/providers";
import { recoverPersonalSignature } from "eth-sig-util";
import { toast, ToastOptions } from "react-toastify";

const castVoteSideChain = (
  provider: Web3Provider | undefined,
  account: string | null | undefined,
  selectedChainStrats: string[],
  selectedChains: string[],
  selectedJarStrats: string[],
  selectedJars: string[],
): void => {
  const voteData: VoteData = {
    timestamp: Date.now(),
    chainWeights: [],
    jarWeights: [],
  };

  selectedChainStrats.forEach((strat) => {
    const inputElement = document.getElementById(strat) as HTMLInputElement;
    const voteWeight = +inputElement.value;
    voteData.chainWeights.push({
      chain: strat,
      weight: voteWeight,
    });
  });

  selectedChains.forEach((chain) => {
    const inputElement = document.getElementById(chain) as HTMLInputElement;
    const voteWeight = +inputElement.value;
    voteData.chainWeights.push({
      chain: chain,
      weight: voteWeight,
    });
  });

  selectedJars.forEach((jar) => {
    const inputElement = document.getElementById(jar) as HTMLInputElement;
    const voteWeight = +inputElement.value;
    voteData.jarWeights.push({
      jarKey: jar,
      weight: voteWeight,
    });
  });

  selectedJarStrats.forEach((strat) => {
    const inputElement = document.getElementById(strat) as HTMLInputElement;
    const voteWeight = +inputElement.value;
    voteData.jarWeights.push({
      jarKey: strat,
      weight: voteWeight,
    });
  });

  const msg = JSON.stringify(voteData, null, 2);
  if (sumVotes(selectedChains, selectedChainStrats) !== 100) {
    toast.error(
      `Sum of Chain Vote Values Must Equal 100. (Current Vote: ${sumVotes(
        selectedChains,
        selectedChainStrats,
      )})`,
      toastSettings,
    );
  } else if (sumVotes(selectedJars, selectedJarStrats) !== 100) {
    toast.error(
      `Sum of Jar Vote Absolute Values Must Equal 100. (Current Vote: ${sumVotes(
        selectedJars,
        selectedJarStrats,
      )})`,
      toastSettings,
    );
  } else {
    sendRequestToDillVoter(msg, account, provider);
  }
};

const sendRequestToDillVoter = async (
  msg: string,
  account: string | null | undefined,
  w3Provider: Web3Provider | undefined,
): Promise<void> => {
  try {
    const encodedMessage = `0x${Buffer.from(msg, "utf8").toString("hex")}`;

    const method = "personal_sign";
    const params = [encodedMessage, account];
    const result: any = w3Provider ? await w3Provider.send(method, params) : null;

    const recoveredAddr: string = recoverPersonalSignature({
      data: msg,
      sig: result,
    });
    console.log("Got a recovered addr");
    if (account && recoveredAddr.toLowerCase() === account.toLowerCase()) {
      const bodyObj = {
        message: msg,
        signature: result,
        signer: account,
      };
      const bodyJson = JSON.stringify(bodyObj);
      toast.info("Sending Vote to API", toastSettings);
      const res = await fetch(DILL_VOTE_API, {
        body: bodyJson,
        method: "POST",
        mode: "cors",
      });
      console.log("Sent to api");
      let text: string = await res.text();
      text = text.replaceAll('"', "");
      console.log("Response is: " + text);
      const status: number = res.status;
      if (status !== 200) {
        console.log("Error: " + text);
        toast.error(text, toastSettings);
      } else {
        console.log("Success: " + text);
        toast.success(text, toastSettings);
      }
      console.log(status);
    } else {
      console.log("No Match");
    }
  } catch (err) {
    const errMsg = JSON.stringify(err);
    console.log(errMsg);
    toast.error("Error Occured. See console for more details.", toastSettings);
  }
};

const sumVotes = (selected: string[], selected2?: string[]): number => {
  let sum = 0;
  selected.forEach((s) => {
    const inputElement = document.getElementById(s) as HTMLInputElement;
    if (+inputElement.value < 0) sum += +inputElement.value * -1;
    else sum += +inputElement.value;
  });
  if (selected2) {
    selected2.forEach((s) => {
      const inputElement = document.getElementById(s) as HTMLInputElement;
      if (+inputElement.value < 0) sum += +inputElement.value * -1;
      else sum += +inputElement.value;
    });
  }
  return sum;
};

const DILL_VOTE_API = "https://f8wgg18t1h.execute-api.us-west-1.amazonaws.com/prod/dill/vote";

interface ChainWeight {
  chain: string;
  weight: number;
}

interface JarWeight {
  jarKey: string;
  weight: number;
}

interface VoteData {
  timestamp: number;
  chainWeights: ChainWeight[];
  jarWeights: JarWeight[];
}

const toastSettings: ToastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  progress: undefined,
};

export default castVoteSideChain;

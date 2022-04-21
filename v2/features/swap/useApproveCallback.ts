import { BigNumber, ContractReceipt } from "ethers";
import { useTokenContract } from "../farms/flows/hooks";

export const useApproveAmount = (tokenAddress: string) => {
  const TokenContract = useTokenContract(tokenAddress);
  const checkTokenApproval = async ({
    owner,
    spender,
  }: {
    owner: string;
    spender: string;
  }): Promise<BigNumber | undefined> => {
    return TokenContract?.allowance(owner, spender);
  };
  const approveToken = async ({
    owner,
    amount,
    spender,
  }: {
    owner: string;
    amount: string;
    spender: string;
  }): Promise<ContractReceipt | undefined> => {
    const trx = await TokenContract?.approve(spender, amount);
    return trx?.wait();
  };
  return {
    approveToken,
    checkTokenApproval,
  };
};

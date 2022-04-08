import { createContainer } from "unstated-next";
import { useState } from "react";
import { TransactionResponse } from "@ethersproject/abstract-provider";

import { Connection } from "./Connection";
import { Contracts } from "./Contracts";
import { ethers } from "ethers";

export enum Status {
  Approving,
  Transfering,
  Success,
  Failed,
  Cancelled,
}

interface TransferStatus {
  [k: string]: Status;
}

interface TransferFunction {
  token: string;
  recipient: string;
  transferCallback: () => Promise<TransactionResponse>;
  approval?: boolean;
  approvalAmountRequired?: ethers.BigNumber;
}

function useERC20Transfer() {
  const { address, provider, signer } = Connection.useContainer();
  const { erc20 } = Contracts.useContainer();

  const [status, setStatus] = useState<TransferStatus>({});

  const transfer = async ({
    token,
    recipient,
    transferCallback,
    approval = true,
    approvalAmountRequired = ethers.constants.MaxUint256,
  }: TransferFunction) => {
    if (erc20 && address && provider && signer) {
      if (approval) {
        const Token = erc20.attach(token).connect(signer);
        const allowance = await Token.allowance(address, recipient);
        if (allowance.lt(approvalAmountRequired)) {
          setTransferStatus(token, recipient, Status.Approving);

          try {
            const tx = await Token.approve(recipient, ethers.constants.MaxUint256);
            await tx.wait();
          } catch (e) {
            setTransferStatus(token, recipient, Status.Failed);
            return false;
          }
        }
      }

      setTransferStatus(token, recipient, Status.Transfering);

      try {
        const tx = await transferCallback();
        const res = await tx.wait();
        setTransferStatus(token, recipient, Status.Success);
        return res;
      } catch (e) {
        console.log("error", e.toString());
        setTransferStatus(token, recipient, Status.Failed);
        return false;
      }
    }
  };

  const setTransferStatus = (token: string, recipient: string, s: Status) => {
    setStatus({
      ...status,
      [`${token.toLowerCase()},${recipient.toLowerCase()}`]: s,
    });
  };

  const getTransferStatus = (token: string, recipient: string): Status => {
    return status[`${token.toLowerCase()},${recipient.toLowerCase()}`];
  };

  return {
    status,
    getTransferStatus,
    transfer,
  };
}

export const ERC20Transfer = createContainer(useERC20Transfer);

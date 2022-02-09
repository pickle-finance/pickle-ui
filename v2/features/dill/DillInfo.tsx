import React, { FC, useState, useEffect } from "react";
import { GetDillModal } from "v2/features/dill/GetDillModal";
import { IncreaseLockDateModal } from "v2/features/dill/IncreaseLockDateModal";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { PICKLE_TOKEN_ADDR, DILL } from "../../../containers/Contracts";
import { ethers } from "picklefinance-core/node_modules/ethers";
import erc20 from "@studydefi/money-legos/erc20";
import { Trans, useTranslation } from "next-i18next";

import Button from "v2/components/Button";
import DillCard from "./DillCard";

const DillInfo: FC = () => {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpen2, setIsOpen2] = useState<boolean>(false);
  const [userBalance, setUserBalance] = useState<string>();
  const { account, library } = useWeb3React<Web3Provider>();

  useEffect(() => {
    const queryBalance = async () => {
      const contract = new ethers.Contract(
        PICKLE_TOKEN_ADDR,
        erc20.abi,
        library,
      );
      const userBalance = await contract.balanceOf(account);
      setUserBalance(ethers.utils.formatUnits(userBalance));
    };
    queryBalance();
  });

  return (
    <>
      <DillCard
        title={t("v2.dill.dillAmount")}
        data={userBalance ? userBalance : "--" || 0.0}
      >
        <Button
          type={parseFloat(userBalance || "0") ? "primary" : "disabled"}
          onClick={() => setIsOpen(true)}
        >
          {t("v2.actions.enable")}
        </Button>
      </DillCard>
      <DillCard
        title={t("v2.dill.unlockDate")}
        data={
          <Trans i18nKey="v2.time.day" count={0}>
            0 days
          </Trans>
        }
      >
        <Button onClick={() => setIsOpen2(true)}>+</Button>
      </DillCard>
      <DillCard title={t("v2.dill.earnedPickles")} data={0}>
        <Button>{t("v2.actions.harvest")}</Button>
      </DillCard>
      <GetDillModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
      <IncreaseLockDateModal
        isOpen={isOpen2}
        closeModal={() => setIsOpen2(false)}
      />
    </>
  );
};

export default DillInfo;

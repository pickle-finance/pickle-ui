import React, { FC, useState, useEffect } from "react";
import { GetDillModal } from "v2/features/dill/GetDillModal";
import { IncreaseLockDateModal } from "v2/features/dill/IncreaseLockDateModal";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { PICKLE_TOKEN_ADDR, DILL } from "../../../containers/Contracts";
import { ethers } from "picklefinance-core/node_modules/ethers";
import erc20 from "@studydefi/money-legos/erc20";
import { useTranslation } from "next-i18next";
import Button from "v2/components/Button";

export const DillInfo: FC<{}> = () => {
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
      <section className="flex mt-10">
        <DillCard
          title={t("dill.dillAmount")}
          data={userBalance ? userBalance : "--" || 0.0}
        >
          {" "}
          <Button
            type={parseFloat(userBalance || "0") ? "primary" : "disabled"}
            onClick={() => setIsOpen(true)}
          >
            {t("dill.buttonEnable")}
          </Button>
        </DillCard>
        <DillCard title={t("dill.unlockDate")} data={`0 ${t("dill.days")}`}>
          {" "}
          <Button onClick={() => setIsOpen2(true)}>
            <div> + </div>
          </Button>
        </DillCard>
        <DillCard title={t("dill.earnedPICKLEs")} data={`0`}>
          {" "}
          <Button>{t("dill.buttonHarvest")}</Button>
        </DillCard>
      </section>
      <GetDillModal isOpen={isOpen} closeModal={() => setIsOpen(false)} />
      <IncreaseLockDateModal
        isOpen={isOpen2}
        closeModal={() => setIsOpen2(false)}
      />
    </>
  );
};

interface Props {
  title: string;
  data: string;
}

const DillCard: FC<React.PropsWithChildren<Props>> = ({
  title,
  data,
  children,
}) => {
  return (
    <aside className="box-border border-solid border-2 border-gray-dark w-64 h-24 overflow-visible rounded-lg flex flex-col justify-between p-3 mr-4">
      <h1 className="w-auto h-auto overflow-visible whitespace-pre font-medium not-italic text-gray-400 text-base tracking-normal leading-5">
        {title}
      </h1>
      <div className="flex justify-between items-end">
        <p className="w-auto h-auto overflow-visible whitespace-pre font-medium not-italic text-green-500 text-base tracking-normal leading-5">
          {data}
        </p>
        {children}
      </div>
    </aside>
  );
};

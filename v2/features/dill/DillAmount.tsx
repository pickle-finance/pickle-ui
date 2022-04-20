import React, { FC, useState } from "react";
import { useTranslation } from "next-i18next";
import { IUserDillStats, UserPickles } from "picklefinance-core/lib/client/UserModel";

import GetDillModal from "v2/features/dill/GetDillModal";
import Button from "v2/components/Button";
import DillCard from "./DillCard";
import { formatEther } from "ethers/lib/utils";
import { ChainNetwork } from "picklefinance-core";

interface Props {
  dill: IUserDillStats;
  pickles: UserPickles;
}

const DillAmount: FC<Props> = ({ dill, pickles }) => {
  const { t } = useTranslation("common");

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <div>
        <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
          <h1 className="font-medium text-foreground-alt-200 text-base leading-5">
            {t("v2.dill.dillAmount")}
          </h1>
          <div className="flex justify-between items-top">
            <div>
              <p className="text-primary whitespace-pre font-medium text-base">
                {parseFloat(formatEther(dill.balance)).toFixed(4)}
              </p>
              <h1 className="font-medium text-foreground-alt-200 text-base leading-5 mt-2">
                {t("v2.dill.pickleBalance")}
              </h1>
              <p className="text-primary whitespace-pre font-medium text-base">
                {parseFloat(formatEther(pickles[ChainNetwork.Ethereum] || "0")).toFixed(4)}
              </p>
            </div>
            <Button type="primary" onClick={() => setIsOpen(true)}>
              {parseFloat(dill.balance) ? t("v2.dill.addDill") : t("v2.dill.getDill")}
            </Button>{" "}
          </div>
        </aside>
      </div>
      <GetDillModal
        isOpen={isOpen}
        dill={dill}
        pickles={pickles}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
};

export default DillAmount;

import React, { FC, useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "next-i18next";
import { formatEther } from "ethers/lib/utils";
import { ChainNetwork } from "picklefinance-core";
import { IUserDillStats, UserPickles } from "picklefinance-core/lib/client/UserModel";

import GetDillModal from "v2/features/dill/GetDillModal";
import Button from "v2/components/Button";
import MoreInfo from "v2/components/MoreInfo";
import { CoreSelectors } from "v2/store/core";
import { formatPercentage, formatDollars } from "v2/utils";

interface Props {
  userDill: IUserDillStats;
  pickles: UserPickles;
}

const DillAmount: FC<Props> = ({ userDill, pickles }) => {
  const picklePrice = useSelector(CoreSelectors.selectPicklePrice);
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const core = useSelector(CoreSelectors.selectCore);

  const dillBalance = parseFloat(formatEther(userDill.balance));
  const totalDill = core?.dill?.totalDill || 0;
  const pickleLocked = parseFloat(formatEther(userDill.pickleLocked || "0"));
  const pickleBalance = parseFloat(formatEther(pickles[ChainNetwork.Ethereum] || "0"));
  return (
    <>
      <div>
        <aside className="border border-foreground-alt-500 grow font-title rounded-lg tracking-normal p-4">
          <h1 className="font-medium text-foreground-alt-200 text-base leading-5">
            {t("v2.dill.dillAmount")}
            {!!dillBalance && (
              <MoreInfo>
                <span className="text-foreground font-bold text-sm">
                  {t("v2.dill.yourShare", {
                    percentage: formatPercentage((dillBalance / totalDill) * 100, 6),
                  })}
                </span>
              </MoreInfo>
            )}
          </h1>
          <div className="flex justify-between items-top">
            <div>
              <br></br>
              <p className="text-primary whitespace-pre font-medium text-base">
                {dillBalance.toFixed(4)}
              </p>
              <br></br>
              <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {pickleLocked.toFixed(2)} {t("v2.dill.pickle")}
                {" ("}
                {formatDollars(pickleLocked * picklePrice)}
                {") "}
                {t("v2.dill.locked")}
              </h1>
              <h1 className="font-body text-foreground-alt-200 font-normal text-xs leading-4">
                {pickleBalance.toFixed(0)} {t("v2.dill.pickle")}
                {pickleBalance !== 0 ? ` (${formatDollars(pickleBalance * picklePrice)}) ` : " "}
                {t("v2.dill.inWallet")}
              </h1>
            </div>
            <Button type="primary" onClick={() => setIsOpen(true)}>
              {dillBalance ? t("v2.dill.addDill") : t("v2.dill.getDill")}
            </Button>
          </div>
          <br></br>
        </aside>
      </div>
      <GetDillModal
        isOpen={isOpen}
        dill={userDill}
        pickles={pickles}
        closeModal={() => setIsOpen(false)}
      />
    </>
  );
};

export default DillAmount;

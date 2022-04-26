import React, { useState } from "react";
import Modal from "v2/components/Modal";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import { useTranslation } from "next-i18next";
import { DEFAULT_SLIPPAGE_TOLERANCE } from "./constants";

export const SettingsTab = ({
  slippageTolerance,
  setSlippageTolerance,
  deadline,
  setDeadline,
}: {
  slippageTolerance: number;
  deadline: number;
  setSlippageTolerance: (val: number) => void;
  setDeadline: (val: number) => void;
}) => {
  const { t } = useTranslation("common");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const openModal = () => setIsOpenModal(true);
  const closeModal = () => setIsOpenModal(false);
  return (
    <div>
      <div className="text-right mb-3">
        {t("v2.swap.settingsTab")}{" "}
        <SettingsOutlinedIcon fontSize="large" onClick={openModal} cursor="pointer" />
      </div>
      <Modal isOpen={isOpenModal} closeModal={closeModal} title={t("v2.swap.settingTitle")}>
        <div className="text-lg text-white mb-2 text-left">
          {t("v2.swap.settingsSlippageFields")}
        </div>
        <div className="flex flex-row">
          <div className="basis-1/4">
            <button
              className="p-1 w-full hover:text-white rounded-2xl border-solid border-2 text-slate-400"
              onClick={() => setSlippageTolerance(DEFAULT_SLIPPAGE_TOLERANCE)}
            >
              {t("v2.swap.slippageAuto")}
            </button>
          </div>
          <div className="basis-1/4" />
          <div className="basis-1/2">
            <input
              type={"number"}
              step={0.01}
              min="0"
              max="50"
              value={slippageTolerance}
              dir="rtl"
              className="text-white	bg-transparent w-full outline-none text-lg rounded-2xl border-solid border-2 pr-5"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.0%"
              minLength={1}
              spellCheck="false"
              onChange={(e) => {
                if (+e.target.value >= 0 && +e.target.value <= 50) {
                  setSlippageTolerance(+e.target.value);
                }
              }}
            />
          </div>
        </div>
        <div className="mt-4 text-lg text-white mb-2 text-left">
          {t("v2.swap.settingsDeadline")}
        </div>
        <div>
          <div className="text-left">
            <input
              value={deadline}
              type={"number"}
              step={1}
              min="0"
              max="100"
              dir="rtl"
              className="text-white	bg-transparent w-1/2 outline-none text-lg rounded-2xl border-solid border-2 pr-5"
              inputMode="decimal"
              autoComplete="off"
              autoCorrect="off"
              pattern="^[0-9]*[.,]?[0-9]*$"
              placeholder="0.0"
              minLength={1}
              maxLength={3}
              spellCheck="false"
              onChange={(e) => {
                if (+e.target.value >= 0 && +e.target.value <= 100) {
                  setDeadline(+e.target.value);
                }
              }}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

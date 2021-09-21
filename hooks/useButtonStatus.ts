import { useCallback } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import { Status } from "../containers/Erc20Transfer";

export interface ButtonStatus {
  disabled: boolean;
  text: string;
}

export const useButtonStatus = () => {
  const { t } = useTranslation("common");
  const { locale } = useRouter();

  const setButtonStatus = useCallback(
    (
      status: Status,
      transfering: string,
      idle: string,
      setButtonText: (status: ButtonStatus) => void,
    ) => {
      // Deposit
      if (status === Status.Approving) {
        setButtonText({
          disabled: true,
          text: t("farms.approving"),
        });
      } else if (status === Status.Transfering) {
        setButtonText({
          disabled: true,
          text: transfering,
        });
      } else {
        setButtonText({
          disabled: false,
          text: idle,
        });
      }
    },
    [locale],
  );

  return { setButtonStatus };
};

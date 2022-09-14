import { FC } from "react";
import { useTranslation } from "next-i18next";
import { PencilIcon } from "@heroicons/react/outline";
import Spinner from "v2/components/Spinner";

const AwaitingOrderConfirmation: FC = () => {
  const { t } = useTranslation("common");

  const title = t("v2.farms.orderSent");

  return (
    <>
      <div className="h-1/4 w-1/4 m-auto">
        <Spinner />
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
    </>
  );
};

export default AwaitingOrderConfirmation;

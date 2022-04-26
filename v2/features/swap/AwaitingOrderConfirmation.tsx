import { FC } from "react";
import { useTranslation } from "next-i18next";
import { PencilIcon } from "@heroicons/react/outline";
import Spinner from "v2/components/Spinner";

const AwaitingOrderConfirmation: FC = () => {
  const { t } = useTranslation("common");

  const title = t("v2.farms.orderSent");

  return (
    <>
      <div className="flex justify-center my-10">
        <PencilIcon className="w-20 h-20 text-primary" />
      </div>
      <h2 className="text-foreground-alt-100 font-title text-lg my-6">{title}</h2>
      <div className="w-5 h-5 mr-3">
        <Spinner />
      </div>
    </>
  );
};

export default AwaitingOrderConfirmation;

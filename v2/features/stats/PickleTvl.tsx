import { FC } from "react";
import { useTranslation } from "next-i18next";

interface Props {
  title: string;
}

const PickleTvl: FC<Props> = ({ title }) => {
  const { t } = useTranslation("common");

  return (
    <>
      <h2 className="font-body font-bold text-xl mb-6">
        {title}
      </h2>
    </>
  );
};

export default PickleTvl;
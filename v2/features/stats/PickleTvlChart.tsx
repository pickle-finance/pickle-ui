import { FC } from "react";
import { useTranslation } from "next-i18next";

const PickleTvlChart: FC = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <div>
        {"Insert Chart"}
      </div>
    </>
  );
};

export default PickleTvlChart;
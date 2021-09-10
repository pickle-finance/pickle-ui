import { FC } from "react";
import { useRouter } from "next/router";

import { Select } from "@geist-ui/react";

interface Props {
  type: "standalone" | "grouped";
}

const LanguageSelect: FC<Props> = ({ type }) => {
  const router = useRouter();

  const handleLanguageSwitch = (locale: string) =>
    router.push("", "", { locale });

  const borderRadius = type === "grouped" ? "5px 0 0 5px" : "5px";

  return (
    <Select
      value={router.locale}
      onChange={(locale) => handleLanguageSwitch(locale as string)}
      style={{
        borderRadius,
        minWidth: "4rem",
      }}
    >
      <Select.Option value="en">EN</Select.Option>
      <Select.Option value="zh-CN">CN</Select.Option>
    </Select>
  );
};

export default LanguageSelect;

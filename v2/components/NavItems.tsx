import { FC } from "react";
import {
  ChartBarIcon,
  LightningBoltIcon,
  QuestionMarkCircleIcon,
  SpeakerphoneIcon,
  TemplateIcon,
  UserGroupIcon,
} from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";

import NavItem from "./NavItem";

const NavItems: FC = () => {
  const { t } = useTranslation("common");

  const navigation = [
    { name: t("v2.nav.dashboard"), href: "/v2", icon: TemplateIcon },
    {
      name: t("v2.nav.jarsAndFarms"),
      href: "/v2/farms",
      icon: LightningBoltIcon,
    },
    { name: t("v2.nav.dill"), href: "#", icon: UserGroupIcon },
    { name: t("v2.nav.stats"), href: "#", icon: ChartBarIcon },
    { name: t("v2.nav.faq"), href: "#", icon: QuestionMarkCircleIcon },
    { name: t("v2.nav.feedback"), href: "#", icon: SpeakerphoneIcon },
  ];

  return (
    <nav className="flex-1 space-y-2">
      {navigation.map((item) => (
        <NavItem key={item.name} Icon={item.icon} href={item.href}>
          {item.name}
        </NavItem>
      ))}
    </nav>
  );
};

export default NavItems;

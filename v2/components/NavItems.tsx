import { FC, MouseEventHandler } from "react";
import {
  AcademicCapIcon,
  ChartBarIcon,
  HeartIcon,
  LightningBoltIcon,
  SpeakerphoneIcon,
  StarIcon,
  TemplateIcon,
  UserGroupIcon,
} from "@heroicons/react/solid";
import { useTranslation } from "next-i18next";

import NavItem from "./NavItem";

interface Props {
  onClick?: MouseEventHandler;
}

const NavItems: FC<Props> = ({ onClick }) => {
  const { t } = useTranslation("common");

  const navigation = [
    { name: t("v2.nav.dashboard"), href: "/v2", icon: TemplateIcon },
    {
      name: t("v2.nav.jarsAndFarms"),
      href: "/v2/farms",
      icon: LightningBoltIcon,
    },
    { name: t("v2.nav.dill"), href: "/v2/dill", icon: UserGroupIcon },
    { name: t("v2.nav.vote"), href: "/v2/vote", icon: StarIcon },
    { name: t("v2.nav.brinery"), href: "/v2/brinery", icon: HeartIcon },
    { name: t("v2.nav.stats"), href: "/v2/stats", icon: ChartBarIcon },
    {
      name: t("v2.nav.docs"),
      href: "https://docs.pickle.finance/",
      icon: AcademicCapIcon,
      external: true,
    },
    {
      name: t("v2.nav.feedback"),
      href: "https://forum.pickle.finance/",
      icon: SpeakerphoneIcon,
      external: true,
    },
  ];

  return (
    <nav className="flex-1 space-y-2">
      {navigation.map((item) => (
        <NavItem
          key={item.name}
          Icon={item.icon}
          href={item.href}
          external={item.external}
          onClick={onClick}
        >
          {item.name}
        </NavItem>
      ))}
    </nav>
  );
};

export default NavItems;

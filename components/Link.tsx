import { FC } from "react";
import { default as NextLink, LinkProps } from "next/link";

/**
 * Use this component for Next links that end up being wrapped inside
 * Trans i18n component. See:
 * https://github.com/i18next/react-i18next/issues/1090
 */
export const Link: FC<LinkProps> = ({ href, children }) => (
  <NextLink href={href}>
    <a>{children}</a>
  </NextLink>
);

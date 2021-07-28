import { FC } from "react";
import styled from "styled-components";
import Link from "next/link";
import { useRouter } from "next/router";

const LogoLink = styled.a`
  text-decoration: none;
  margin-right: 1rem;

  @media screen and (max-width: 600px) {
    margin-left: 0.5rem;
  }
`;

interface TextLogoProps {
  active?: boolean;
}

const ImageLogo = styled.img<TextLogoProps>`

  position: relative;
  width: 8rem;

  &::after {
    content: "";
    border-bottom: 2px solid var(--accent-color);
    box-shadow: var(--accent-glow-color) 0 0 6px 0;
    display: ${(props) => (props.active ? "block" : "none")};
    position: absolute;
    right: 6px;
    left: 0px;
    bottom: -4px;

    @media screen and (max-width: 600px) {
      right: 2px;
    }
  }

  &:hover {
    text-shadow: var(--link-glow);
  }
`;

export const Logo: FC = () => {
  const router = useRouter();
  return (
    <Link href="/" passHref>
      <LogoLink>
        <ImageLogo
          active={router.pathname === "/"}
          src="/pickle-logo.png"
        />
      </LogoLink>
    </Link>
  );
};

import { FC } from "react";
import styled from "styled-components";
import Link from "next/link";
import Image from "next/image";

import pickleLogo from "../../public/pickle-logo.png";

const ImageContainer = styled.div`
  position: relative;
  width: 8rem;
  margin-right: 1rem;
  flex-shrink: 0.75;
`;

export const Logo: FC = () => (
  <ImageContainer>
    <Link href="/">
      <a aria-label="Pickle Finance app homepage">
        <Image
          src={pickleLogo}
          width={500}
          height={191}
          priority
          layout="responsive"
          alt="Pickle Finance"
          title="Pickle Finance"
          placeholder="blur"
        />
      </a>
    </Link>
  </ImageContainer>
);

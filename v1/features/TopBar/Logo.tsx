import { FC } from "react";
import { styled } from '@mui/material/styles';
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "next-i18next";

const ImageContainer = styled('div')`
  position: relative;
  width: 8rem;
  margin-right: 1rem;
  flex-shrink: 0.75;

  @media screen and (max-width: 600px) {
    margin-right: 0.75rem;
  }
`;

export const Logo: FC = () => {
  const { t } = useTranslation("common");

  return (
    <ImageContainer>
      <Link aria-label={t("meta.title") as string} href="/v1">
        <Image
          src="/pickle.svg"
          width={158}
          height={60}
          alt={t("meta.titleFull")}
          title={t("meta.titleFull") as string}
          priority
        />
      </Link>
    </ImageContainer>
  );
};

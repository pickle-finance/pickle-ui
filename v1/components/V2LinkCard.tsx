import styled from "styled-components";
import { Card } from "@geist-ui/react";
import { Trans } from "next-i18next";
import Link from "next/link";

const Container = styled.div`
  width: 750pt;
  max-width: 100vw;
  margin: 2rem auto 0;
  padding: 0 16pt;
  text-align: center;
`;

const V2LinkCard = () => (
  <Container>
    <Card>
      Experience the <Link href="/">new Pickle Finance app ⚡✨</Link>
    </Card>
  </Container>
);

export default V2LinkCard;

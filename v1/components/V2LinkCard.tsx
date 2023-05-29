import { styled } from '@mui/material/styles';
import { Card } from "@geist-ui/core";
import Link from "next/link";

const Container = styled('div')`
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

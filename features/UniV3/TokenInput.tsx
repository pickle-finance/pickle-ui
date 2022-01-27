import { BigNumber, ethers } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import React, { useState, FC, useEffect } from "react";
import { Trans, useTranslation } from "next-i18next";
import { Link, Input, Grid, Spacer, Select, Button } from "@geist-ui/react";
import { formatValue } from "./UniV3JarMiniFarmCollapsible";
import { UniV3Token } from "containers/Jars/useJarsWithUniV3";
import erc20 from "@studydefi/money-legos/erc20";
import { Connection } from "containers/Connection";

export const TokenInput: FC<{
  token: UniV3Token;
  otherToken: UniV3Token;
  isToken0: boolean;
  setDepositThisAmount: any;
  proportion: BigNumber;
  depositAmount: string;
  jarAddr: string;
}> = ({
  token,
  otherToken,
  isToken0,
  setDepositThisAmount,
  proportion,
  depositAmount,
  jarAddr,
}) => {
  const { signer, address, blockNum } = Connection.useContainer();
  const [userApproved, setUserApproved] = useState(false);
  const { t } = useTranslation("common");
  const balanceUsed = token?.walletBalance;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {t("balances.balance")}:{" "}
          {formatValue(parseFloat(formatUnits(balanceUsed, token.decimals)))}{" "}
          {token.name.toUpperCase()}
        </div>
        <Link
          color
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setDepositThisAmount(formatUnits(balanceUsed, token.decimals));
          }}
        >
          {t("balances.max")}
        </Link>
      </div>
      <Grid.Container gap={3}>
        <Grid md={24}>
          <Input
            onChange={(e) => {
              setDepositThisAmount(e.target.value);
            }}
            value={depositAmount}
            width="100%"
            iconRight={
              <ApproveButton
                depositTokenAddr={token.address}
                jarAddr={jarAddr}
                signer={signer}
                approved={token.approved || userApproved}
                setUserApproved={setUserApproved}
              />
            }
          />
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
    </>
  );
};

const ApproveButton: FC<{
  depositTokenAddr: string;
  jarAddr: string;
  signer: any;
  approved: boolean;
  setUserApproved: any;
}> = ({ depositTokenAddr, jarAddr, signer, approved, setUserApproved }) => {
  const [buttonText, setButtonText] = useState("Approve");

  useEffect(() => {
    setButtonText(approved ? "Approved" : "Approve");
  }, [approved]);

  return (
    <Button
      style={{
        lineHeight: "inherit",
        right: "550%",
        height: "1.5rem",
        minWidth: "6.5rem",
      }}
      disabled={approved}
      onClick={async () => {
        const Token = new ethers.Contract(depositTokenAddr, erc20.abi, signer);
        setButtonText("Approving");
        setUserApproved(true);
        const tx = await Token.approve(jarAddr, ethers.constants.MaxUint256);
        await tx.wait();
        setButtonText("Approved");
      }}
    >
      {buttonText}
    </Button>
  );
};

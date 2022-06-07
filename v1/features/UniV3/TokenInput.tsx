import { BigNumber, ethers } from "ethers";
import { formatUnits, parseEther, parseUnits } from "ethers/lib/utils";
import React, { useState, FC, useEffect } from "react";
import { Trans, useTranslation } from "next-i18next";
import { Link, Input, Grid, Spacer, Button, Select } from "@geist-ui/react";
import { formatValue } from "./UniV3JarMiniFarmCollapsible";
import { UniV3Token } from "v1/containers/Jars/useJarsWithUniV3";
import erc20 from "@studydefi/money-legos/erc20";
import { Connection } from "v1/containers/Connection";

export const TokenInput: FC<{
  token: UniV3Token;
  otherToken: UniV3Token;
  isToken0: boolean;
  setDepositThisAmount: any;
  proportion: BigNumber;
  depositAmount: string;
  jarAddr: string;
  setUseEth: any;
}> = ({
  token,
  otherToken,
  isToken0,
  setDepositThisAmount,
  proportion,
  depositAmount,
  jarAddr,
  setUseEth,
}) => {
  const { signer, address, blockNum } = Connection.useContainer();
  const ethOptions = ["MATIC", "WMATIC"];
  const [inputToken, setInputToken] = useState(ethOptions[0]);
  const [ethBalance, setEthBalance] = useState(BigNumber.from(0));
  const [userApproved, setUserApproved] = useState(false);

  // In the future, make this an array to check for the native gas token on diff chains
  const isEth = token?.address.toLowerCase() === "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270";
  const ethSelected = isEth && inputToken === ethOptions[0];
  const { t } = useTranslation("common");
  const balanceUsed = ethSelected ? ethBalance : token?.walletBalance;

  useEffect(() => {
    const setBalance = async () => setEthBalance(await signer.getBalance());
    setBalance();
  }, [address, blockNum]);

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
        {isEth && (
          <Grid md={8}>
            <Select
              size="medium"
              width="100%"
              value={inputToken}
              onChange={(e) => {
                setInputToken(e.toString());
                setUseEth(ethSelected);
              }}
            >
              {ethOptions.map((token) => (
                <Select.Option style={{ fontSize: "1rem" }} value={token} key={token}>
                  <div style={{ display: `flex`, alignItems: `center` }}>{token}</div>
                </Select.Option>
              ))}
            </Select>
          </Grid>
        )}
        <Grid md={isEth ? 16 : 24}>
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
                approved={(isEth && inputToken === ethOptions[0]) || token.approved || userApproved}
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

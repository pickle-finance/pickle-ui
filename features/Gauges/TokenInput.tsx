import { BigNumber, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import React, { useState, FC, useEffect } from "react";
import { Trans, useTranslation } from "next-i18next";
import { Link, Input, Grid, Spacer, Select, Button } from "@geist-ui/react";
import { toNum, formatValue } from "./UniV3JarGaugeCollapsible";
import { weth } from "util/univ3";
import { UniV3Token } from "containers/Jars/useJarsWithUniV3";
import erc20 from "@studydefi/money-legos/erc20";

export const TokenInput: FC<{
  token: UniV3Token;
  isToken0: boolean;
  setDepositThisAmount: any;
  setDepositOtherAmount: any;
  proportion: BigNumber;
  depositAmount: string;
  jarAddr: string;
  signer: any;
  setUseEth: any;
}> = ({
  token,
  isToken0,
  setDepositThisAmount,
  setDepositOtherAmount,
  proportion,
  depositAmount,
  jarAddr,
  signer,
  setUseEth,
}) => {
  const ethOptions = ["ETH", "WETH"];
  const [inputToken, setInputToken] = useState(ethOptions[0]);
  const [ethBalance, setEthBalance] = useState(BigNumber.from(0));
  const [userApproved, setUserApproved] = useState(false);
  const { t } = useTranslation("common");
  const isEth = token?.address.toLowerCase() === weth;
  const ethSelected = isEth && inputToken === ethOptions[0];
  const balanceUsed = ethSelected ? ethBalance : token?.walletBalance;

  useEffect(() => {
    const setBalance = async () => setEthBalance(await signer.getBalance());
    setBalance();
  }, []);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          {t("balances.balance")}: {formatValue(toNum(balanceUsed))}{" "}
          {isEth ? inputToken : token?.name}
        </div>
        <Link
          color
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setDepositThisAmount(formatEther(balanceUsed));
            setDepositOtherAmount(
              formatEther(
                isToken0
                  ? balanceUsed.mul(proportion).div(parseEther("1"))
                  : balanceUsed.mul(parseEther("1")).div(proportion),
              ),
            );
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
                <Select.Option
                  style={{ fontSize: "1rem" }}
                  value={token}
                  key={token}
                >
                  <div style={{ display: `flex`, alignItems: `center` }}>
                    {token}
                  </div>
                </Select.Option>
              ))}
            </Select>
          </Grid>
        )}
        <Grid md={isEth ? 16 : 24}>
          <Input
            onChange={(e) => {
              setDepositThisAmount(e.target.value);
              setDepositOtherAmount(
                formatEther(
                  isToken0
                    ? parseEther(e.target.value)
                        .mul(proportion)
                        .div(parseEther("1"))
                    : parseEther(e.target.value)
                        .mul(parseEther("1"))
                        .div(proportion),
                ),
              );
            }}
            value={depositAmount}
            width="100%"
            iconRight={
              <ApproveButton
                depositTokenAddr={token.address}
                jarAddr={jarAddr}
                signer={signer}
                approved={
                  (isEth && inputToken === ethOptions[0]) ||
                  token.approved ||
                  userApproved
                }
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
        const tx = await Token.approve(jarAddr, ethers.constants.MaxUint256);
        await tx.wait();
        setUserApproved(true);
        setButtonText("Approved");
      }}
    >
      {buttonText}
    </Button>
  );
};
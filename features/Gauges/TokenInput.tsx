import { BigNumber, ethers } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils";
import React, { useState, FC, useEffect } from "react";
import { Trans, useTranslation } from "next-i18next";
import {
  Link,
  Input,
  Grid,
  Spacer,
  Select,
} from "@geist-ui/react";
import { ApproveButton, UniV3, toNum, formatValue } from "./UniV3JarGaugeCollapsible";
import { weth } from "util/univ3";

export const TokenInput: FC<{
  token: UniV3;
  isToken0: boolean;
  setDepositThisAmount: any;
  setDepositOtherAmount: any;
  proportion: BigNumber;
  depositAmount: string;
  jarAddr: string;
  signer: any;
  setToken: any;
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
  setToken,
  setUseEth,
}) => {
  const ethOptions = ["ETH", "WETH"];
  const [inputToken, setInputToken] = useState(ethOptions[0]);
  const [ethBalance, setEthBalance] = useState(BigNumber.from(0));
  const { t } = useTranslation("common");
  const isEth = token?.address.toLowerCase() === weth;
  const ethSelected = isEth && inputToken === ethOptions[0];
  const balanceUsed = ethSelected ? ethBalance : token?.balance;

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
          <Grid md={4}>
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
        <Grid md={isEth ? 20 : 24}>
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
                  (isEth && inputToken === ethOptions[0]) || token.approved
                }
                setToken={setToken}
              />
            }
          />
        </Grid>
      </Grid.Container>
      <Spacer y={0.5} />
    </>
  );
};

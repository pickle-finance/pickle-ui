import { FC, useState, useEffect } from "react";
import { ethers } from "ethers";
import { Card, Grid, Button, Spacer } from "@geist-ui/react";

import { Jars } from "../../containers/Jars-Polygon";
import { UserJars } from "../../containers/UserJars";
import { Connection } from "../../containers/Connection";
import { Contracts } from "../../containers/Contracts";

import { parseEther } from "ethers/lib/utils";

import { getTargetAndData } from "./getTargetAndData";
import { PreviewFooter } from "./PreviewFooter";
import { JarSelectors } from "./JarSelectors";
import { InputOptions } from "./InputOptions";

export const Swap: FC = () => {
  const { address, signer, blockNum } = Connection.useContainer();
  const { jars } = Jars.useContainer();
  const { jarData } = UserJars.useContainer();
  const {
    controller,
    curveProxyLogic,
    uniswapv2ProxyLogic,
  } = Contracts.useContainer();

  const [from, setFrom] = useState("pJar 0a");
  const [to, setTo] = useState("pJar 0b");

  const [approving, setApproving] = useState<boolean>(false);
  const [swapping, setSwapping] = useState<boolean>(false);
  const [querying, setQuerying] = useState<boolean>(false);
  const [queryEstimateReturnId, setQueryEstimateReturnId] = useState<
    number | null
  >(null);
  const [
    estimatedReturns,
    setEstimatedReturns,
  ] = useState<ethers.BigNumber | null>(null);
  const [swapAmount, setSwapAmount] = useState<string>("");
  const [slippage, setSlippage] = useState<number>(0.5);
  const [allowance, setAllowance] = useState<ethers.BigNumber | null>(null);

  const toJar = jarData?.filter((jar) => jar.name === to)[0];
  const fromJar = jarData?.filter((jar) => jar.name === from)[0];

  const handleFromSelect = (val: string | string[]) => setFrom(val.toString());
  const handleToSelect = (val: string | string[]) => setTo(val.toString());

  const queryAllowance = async () => {
    if (!controller || !fromJar || !address) return;

    const a = await fromJar.jarContract.allowance(address, controller.address);

    setAllowance(a);
  };

  useEffect(() => {
    queryAllowance();
  }, [from, to, blockNum]);

  useEffect(() => {
    const g = async () => {
      // Start the querying
      if (
        !signer ||
        !fromJar ||
        !toJar ||
        !allowance ||
        !controller ||
        !uniswapv2ProxyLogic ||
        !curveProxyLogic ||
        !address ||
        swapAmount === "" ||
        !swapAmount
      )
        return;

      // Make sure its a number
      try {
        parseFloat(swapAmount);
      } catch {
        return;
      }

      // Remove previous query thread
      if (queryEstimateReturnId) {
        clearTimeout(queryEstimateReturnId);
      }

      if (allowance.gt(ethers.constants.Zero)) {
        setQuerying(true);
        setEstimatedReturns(null);

        const [targets, data] = getTargetAndData(
          fromJar,
          toJar,
          curveProxyLogic,
          uniswapv2ProxyLogic,
          address,
        );

        try {
          const ret = await controller
            .connect(signer)
            .callStatic.swapExactJarForJar(
              fromJar.jarContract.address,
              toJar.jarContract.address,
              ethers.utils.parseEther(swapAmount),
              ethers.constants.Zero,
              targets,
              data,
              {
                gasLimit: 8000000,
              },
            );
          setEstimatedReturns(ret);
        } catch (e) {
          console.log("error estimating jar", e.toString());
        }

        setQuerying(false);
      }
    };

    const id = setTimeout(g, 750);
    setQueryEstimateReturnId(id);
  }, [from, to, allowance, swapAmount]);

  const needsApproval =
    !allowance || (allowance && allowance.lte(ethers.constants.Zero));

  return (
    <Grid.Container gap={2}>
      <Grid xs={24} sm={24} md={24}>
        <Card>
          <Card.Content>
            <Grid.Container gap={2}>
              <JarSelectors
                jars={jars}
                from={from}
                to={to}
                handleFromSelect={handleFromSelect}
                handleToSelect={handleToSelect}
              />
              <InputOptions
                fromJar={fromJar}
                swapAmount={swapAmount}
                setSwapAmount={setSwapAmount}
                slippage={slippage}
                setSlippage={setSlippage}
              />
              <Spacer y={1} />
              <Grid xs={24}>
                <Button
                  disabled={approving || swapping}
                  onClick={async () => {
                    if (
                      !fromJar ||
                      !toJar ||
                      !controller ||
                      !signer ||
                      !curveProxyLogic ||
                      !uniswapv2ProxyLogic ||
                      !address
                    )
                      return;

                    if (needsApproval) {
                      setApproving(true);
                      try {
                        const tx = await fromJar.jarContract
                          .connect(signer)
                          .approve(
                            controller.address,
                            ethers.constants.MaxUint256,
                          );
                        await tx.wait();
                      } catch (e) {
                        console.log("swap: approving: error", e.toString());
                      }
                      await queryAllowance();
                      setApproving(false);
                    }

                    if (!needsApproval) {
                      if (!estimatedReturns) return;

                      setSwapping(true);
                      const [targets, data] = getTargetAndData(
                        fromJar,
                        toJar,
                        curveProxyLogic,
                        uniswapv2ProxyLogic,
                        address,
                      );

                      try {
                        const tx = await controller
                          .connect(signer)
                          .swapExactJarForJar(
                            fromJar.jarContract.address,
                            toJar.jarContract.address,
                            ethers.utils.parseEther(swapAmount),
                            estimatedReturns.sub(
                              estimatedReturns
                                .mul(parseEther(slippage.toString()))
                                .div(parseEther("100")),
                            ),
                            targets,
                            data,
                            {
                              gasLimit: 2600000,
                            },
                          );
                        await tx.wait();
                      } catch (e) {
                        console.log("swap: swapping: error", e.toString());
                      }

                      setSwapping(false);
                    }
                  }}
                  style={{ width: `100%` }}
                >
                  {needsApproval && !approving && "Approve"}
                  {needsApproval && approving && "Approving..."}
                  {!needsApproval && !swapping && "Swap"}
                  {!needsApproval && swapping && "Swapping..."}
                </Button>
              </Grid>
            </Grid.Container>
          </Card.Content>
          <PreviewFooter
            swapAmount={swapAmount}
            fromJar={fromJar}
            toJar={toJar}
            needsApproval={needsApproval}
            querying={querying}
            estimatedReturns={estimatedReturns}
          />
        </Card>
      </Grid>
    </Grid.Container>
  );
};

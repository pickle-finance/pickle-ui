import styled from "styled-components";
import isEmpty from "lodash/isEmpty";
import React, { FC, useCallback, useState } from "react";
import { SwapSelect } from "./SwapSelector";
import { getAmountWRTUpperDenom } from "./utils";
import FlipCameraAndroidOutlinedIcon from "@material-ui/icons/FlipCameraAndroidOutlined";
import { OrderKind } from "@cowprotocol/cow-sdk";
import BigNumber from "bignumber.js";

const InfoDiv = styled.div`
  color: rgb(197, 218, 239);
  font-size: 16px;
  font-weight: 500;
  margin-top: 2rem;
`;

const KeyValDiv = styled.div`
  display: flex;
  justify-content: space-between;
`;

interface SwapInfoProps {
  isEligibleQoute: boolean;
  token1: SwapSelect | undefined;
  token2: SwapSelect | undefined;
  costOfOneTokenWRTOtherToken: (val?: boolean) => string;
  getFee: () => string;
  qoute: any;
  kind: OrderKind;
}

interface KeyValueProps {
  label: string | React.ReactNode;
  value: string;
  isShow: boolean;
}

export const KeyValue: FC<KeyValueProps> = ({ isShow, label, value }) => {
  return (
    <KeyValDiv>
      <div>{label}</div>
      {isShow && <div>{value}</div>}
    </KeyValDiv>
  );
};

export const SwapInfo: FC<SwapInfoProps> = ({
  isEligibleQoute,
  token1,
  token2,
  costOfOneTokenWRTOtherToken,
  getFee,
  qoute,
  kind,
}) => {
  const [flip, setFlip] = useState(false);

  return (
    <InfoDiv>
      <KeyValue
        label={
          <div>
            <span>Price</span>{" "}
            <span>
              {isEligibleQoute && (
                <FlipCameraAndroidOutlinedIcon
                  cursor="pointer"
                  onClick={() => setFlip((state) => !state)}
                  fontSize="small"
                />
              )}
            </span>
          </div>
        }
        value={`1 ${flip ? token2?.label : token1?.label} = ${costOfOneTokenWRTOtherToken(flip)} ${
          flip ? token1?.label : token2?.label
        }`}
        isShow={isEligibleQoute}
      />

      <KeyValue
        label="Fee"
        value={`${getFee()} ${kind === OrderKind.SELL ? token2?.label : token1?.label}`}
        isShow={!isEmpty(qoute?.data)}
      />
    </InfoDiv>
  );
};

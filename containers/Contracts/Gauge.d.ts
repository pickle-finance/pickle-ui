/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
  Contract,
  ContractTransaction,
  Overrides,
  CallOverrides,
} from "ethers";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";
import { TypedEventFilter, TypedEvent, TypedListener } from "./commons";

interface GaugeInterface extends ethers.utils.Interface {
  functions: {
    "DILL()": FunctionFragment;
    "DISTRIBUTION()": FunctionFragment;
    "DURATION()": FunctionFragment;
    "PICKLE()": FunctionFragment;
    "TOKEN()": FunctionFragment;
    "TREASURY()": FunctionFragment;
    "balanceOf(address)": FunctionFragment;
    "deposit(uint256)": FunctionFragment;
    "depositAll()": FunctionFragment;
    "derivedBalance(address)": FunctionFragment;
    "derivedBalances(address)": FunctionFragment;
    "derivedSupply()": FunctionFragment;
    "earned(address)": FunctionFragment;
    "exit()": FunctionFragment;
    "getReward()": FunctionFragment;
    "getRewardForDuration()": FunctionFragment;
    "kick(address)": FunctionFragment;
    "lastTimeRewardApplicable()": FunctionFragment;
    "lastUpdateTime()": FunctionFragment;
    "notifyRewardAmount(uint256)": FunctionFragment;
    "periodFinish()": FunctionFragment;
    "rewardPerToken()": FunctionFragment;
    "rewardPerTokenStored()": FunctionFragment;
    "rewardRate()": FunctionFragment;
    "rewards(address)": FunctionFragment;
    "totalSupply()": FunctionFragment;
    "userRewardPerTokenPaid(address)": FunctionFragment;
    "withdraw(uint256)": FunctionFragment;
    "withdrawAll()": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "DILL", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "DISTRIBUTION",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "DURATION", values?: undefined): string;
  encodeFunctionData(functionFragment: "PICKLE", values?: undefined): string;
  encodeFunctionData(functionFragment: "TOKEN", values?: undefined): string;
  encodeFunctionData(functionFragment: "TREASURY", values?: undefined): string;
  encodeFunctionData(functionFragment: "balanceOf", values: [string]): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "depositAll",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "derivedBalance",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "derivedBalances",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "derivedSupply",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "earned", values: [string]): string;
  encodeFunctionData(functionFragment: "exit", values?: undefined): string;
  encodeFunctionData(functionFragment: "getReward", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "getRewardForDuration",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "kick", values: [string]): string;
  encodeFunctionData(
    functionFragment: "lastTimeRewardApplicable",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "lastUpdateTime",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "notifyRewardAmount",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "periodFinish",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardPerToken",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardPerTokenStored",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "rewardRate",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "rewards", values: [string]): string;
  encodeFunctionData(
    functionFragment: "totalSupply",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "userRewardPerTokenPaid",
    values: [string]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawAll",
    values?: undefined
  ): string;

  decodeFunctionResult(functionFragment: "DILL", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "DISTRIBUTION",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "DURATION", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "PICKLE", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "TOKEN", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "TREASURY", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "balanceOf", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "depositAll", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "derivedBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "derivedBalances",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "derivedSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "earned", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "exit", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "getReward", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getRewardForDuration",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "kick", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "lastTimeRewardApplicable",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "lastUpdateTime",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "notifyRewardAmount",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "periodFinish",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardPerToken",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "rewardPerTokenStored",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "rewardRate", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "rewards", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "totalSupply",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "userRewardPerTokenPaid",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawAll",
    data: BytesLike
  ): Result;

  events: {
    "Recovered(address,uint256)": EventFragment;
    "RewardAdded(uint256)": EventFragment;
    "RewardPaid(address,uint256)": EventFragment;
    "RewardsDurationUpdated(uint256)": EventFragment;
    "Staked(address,uint256)": EventFragment;
    "Withdrawn(address,uint256)": EventFragment;
  };

  getEvent(nameOrSignatureOrTopic: "Recovered"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RewardAdded"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RewardPaid"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "RewardsDurationUpdated"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Staked"): EventFragment;
  getEvent(nameOrSignatureOrTopic: "Withdrawn"): EventFragment;
}

export class Gauge extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  listeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter?: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): Array<TypedListener<EventArgsArray, EventArgsObject>>;
  off<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  on<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  once<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeListener<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>,
    listener: TypedListener<EventArgsArray, EventArgsObject>
  ): this;
  removeAllListeners<EventArgsArray extends Array<any>, EventArgsObject>(
    eventFilter: TypedEventFilter<EventArgsArray, EventArgsObject>
  ): this;

  listeners(eventName?: string): Array<Listener>;
  off(eventName: string, listener: Listener): this;
  on(eventName: string, listener: Listener): this;
  once(eventName: string, listener: Listener): this;
  removeListener(eventName: string, listener: Listener): this;
  removeAllListeners(eventName?: string): this;

  queryFilter<EventArgsArray extends Array<any>, EventArgsObject>(
    event: TypedEventFilter<EventArgsArray, EventArgsObject>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEvent<EventArgsArray & EventArgsObject>>>;

  interface: GaugeInterface;

  functions: {
    DILL(overrides?: CallOverrides): Promise<[string]>;

    "DILL()"(overrides?: CallOverrides): Promise<[string]>;

    DISTRIBUTION(overrides?: CallOverrides): Promise<[string]>;

    "DISTRIBUTION()"(overrides?: CallOverrides): Promise<[string]>;

    DURATION(overrides?: CallOverrides): Promise<[BigNumber]>;

    "DURATION()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    PICKLE(overrides?: CallOverrides): Promise<[string]>;

    "PICKLE()"(overrides?: CallOverrides): Promise<[string]>;

    TOKEN(overrides?: CallOverrides): Promise<[string]>;

    "TOKEN()"(overrides?: CallOverrides): Promise<[string]>;

    TREASURY(overrides?: CallOverrides): Promise<[string]>;

    "TREASURY()"(overrides?: CallOverrides): Promise<[string]>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    deposit(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    depositAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "depositAll()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    derivedBalance(
      account: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "derivedBalance(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    derivedBalances(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "derivedBalances(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    derivedSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    "derivedSupply()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    earned(account: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    "earned(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    exit(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "exit()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getReward(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "getReward()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    getRewardForDuration(overrides?: CallOverrides): Promise<[BigNumber]>;

    "getRewardForDuration()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    kick(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "kick(address)"(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    lastTimeRewardApplicable(overrides?: CallOverrides): Promise<[BigNumber]>;

    "lastTimeRewardApplicable()"(
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    lastUpdateTime(overrides?: CallOverrides): Promise<[BigNumber]>;

    "lastUpdateTime()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    notifyRewardAmount(
      reward: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "notifyRewardAmount(uint256)"(
      reward: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    periodFinish(overrides?: CallOverrides): Promise<[BigNumber]>;

    "periodFinish()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewardPerToken(overrides?: CallOverrides): Promise<[BigNumber]>;

    "rewardPerToken()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewardPerTokenStored(overrides?: CallOverrides): Promise<[BigNumber]>;

    "rewardPerTokenStored()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewardRate(overrides?: CallOverrides): Promise<[BigNumber]>;

    "rewardRate()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    rewards(arg0: string, overrides?: CallOverrides): Promise<[BigNumber]>;

    "rewards(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    totalSupply(overrides?: CallOverrides): Promise<[BigNumber]>;

    "totalSupply()"(overrides?: CallOverrides): Promise<[BigNumber]>;

    userRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    "userRewardPerTokenPaid(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<[BigNumber]>;

    withdraw(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "withdraw(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    withdrawAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;

    "withdrawAll()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<ContractTransaction>;
  };

  DILL(overrides?: CallOverrides): Promise<string>;

  "DILL()"(overrides?: CallOverrides): Promise<string>;

  DISTRIBUTION(overrides?: CallOverrides): Promise<string>;

  "DISTRIBUTION()"(overrides?: CallOverrides): Promise<string>;

  DURATION(overrides?: CallOverrides): Promise<BigNumber>;

  "DURATION()"(overrides?: CallOverrides): Promise<BigNumber>;

  PICKLE(overrides?: CallOverrides): Promise<string>;

  "PICKLE()"(overrides?: CallOverrides): Promise<string>;

  TOKEN(overrides?: CallOverrides): Promise<string>;

  "TOKEN()"(overrides?: CallOverrides): Promise<string>;

  TREASURY(overrides?: CallOverrides): Promise<string>;

  "TREASURY()"(overrides?: CallOverrides): Promise<string>;

  balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  "balanceOf(address)"(
    account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  deposit(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "deposit(uint256)"(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  depositAll(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "depositAll()"(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  derivedBalance(
    account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "derivedBalance(address)"(
    account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  derivedBalances(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  "derivedBalances(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  derivedSupply(overrides?: CallOverrides): Promise<BigNumber>;

  "derivedSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

  earned(account: string, overrides?: CallOverrides): Promise<BigNumber>;

  "earned(address)"(
    account: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  exit(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "exit()"(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getReward(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "getReward()"(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  getRewardForDuration(overrides?: CallOverrides): Promise<BigNumber>;

  "getRewardForDuration()"(overrides?: CallOverrides): Promise<BigNumber>;

  kick(
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "kick(address)"(
    account: string,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  lastTimeRewardApplicable(overrides?: CallOverrides): Promise<BigNumber>;

  "lastTimeRewardApplicable()"(overrides?: CallOverrides): Promise<BigNumber>;

  lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;

  "lastUpdateTime()"(overrides?: CallOverrides): Promise<BigNumber>;

  notifyRewardAmount(
    reward: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "notifyRewardAmount(uint256)"(
    reward: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  periodFinish(overrides?: CallOverrides): Promise<BigNumber>;

  "periodFinish()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;

  "rewardPerToken()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;

  "rewardPerTokenStored()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewardRate(overrides?: CallOverrides): Promise<BigNumber>;

  "rewardRate()"(overrides?: CallOverrides): Promise<BigNumber>;

  rewards(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

  "rewards(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

  "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

  userRewardPerTokenPaid(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  "userRewardPerTokenPaid(address)"(
    arg0: string,
    overrides?: CallOverrides
  ): Promise<BigNumber>;

  withdraw(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "withdraw(uint256)"(
    amount: BigNumberish,
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  withdrawAll(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  "withdrawAll()"(
    overrides?: Overrides & { from?: string | Promise<string> }
  ): Promise<ContractTransaction>;

  callStatic: {
    DILL(overrides?: CallOverrides): Promise<string>;

    "DILL()"(overrides?: CallOverrides): Promise<string>;

    DISTRIBUTION(overrides?: CallOverrides): Promise<string>;

    "DISTRIBUTION()"(overrides?: CallOverrides): Promise<string>;

    DURATION(overrides?: CallOverrides): Promise<BigNumber>;

    "DURATION()"(overrides?: CallOverrides): Promise<BigNumber>;

    PICKLE(overrides?: CallOverrides): Promise<string>;

    "PICKLE()"(overrides?: CallOverrides): Promise<string>;

    TOKEN(overrides?: CallOverrides): Promise<string>;

    "TOKEN()"(overrides?: CallOverrides): Promise<string>;

    TREASURY(overrides?: CallOverrides): Promise<string>;

    "TREASURY()"(overrides?: CallOverrides): Promise<string>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    depositAll(overrides?: CallOverrides): Promise<void>;

    "depositAll()"(overrides?: CallOverrides): Promise<void>;

    derivedBalance(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "derivedBalance(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    derivedBalances(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "derivedBalances(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    derivedSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "derivedSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    earned(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "earned(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exit(overrides?: CallOverrides): Promise<void>;

    "exit()"(overrides?: CallOverrides): Promise<void>;

    getReward(overrides?: CallOverrides): Promise<void>;

    "getReward()"(overrides?: CallOverrides): Promise<void>;

    getRewardForDuration(overrides?: CallOverrides): Promise<BigNumber>;

    "getRewardForDuration()"(overrides?: CallOverrides): Promise<BigNumber>;

    kick(account: string, overrides?: CallOverrides): Promise<void>;

    "kick(address)"(account: string, overrides?: CallOverrides): Promise<void>;

    lastTimeRewardApplicable(overrides?: CallOverrides): Promise<BigNumber>;

    "lastTimeRewardApplicable()"(overrides?: CallOverrides): Promise<BigNumber>;

    lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;

    "lastUpdateTime()"(overrides?: CallOverrides): Promise<BigNumber>;

    notifyRewardAmount(
      reward: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    "notifyRewardAmount(uint256)"(
      reward: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    periodFinish(overrides?: CallOverrides): Promise<BigNumber>;

    "periodFinish()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardPerToken()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardPerTokenStored()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardRate(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardRate()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewards(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "rewards(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    userRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "userRewardPerTokenPaid(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(amount: BigNumberish, overrides?: CallOverrides): Promise<void>;

    "withdraw(uint256)"(
      amount: BigNumberish,
      overrides?: CallOverrides
    ): Promise<void>;

    withdrawAll(overrides?: CallOverrides): Promise<void>;

    "withdrawAll()"(overrides?: CallOverrides): Promise<void>;
  };

  filters: {
    Recovered(
      token: null,
      amount: null
    ): TypedEventFilter<
      [string, BigNumber],
      { token: string; amount: BigNumber }
    >;

    RewardAdded(
      reward: null
    ): TypedEventFilter<[BigNumber], { reward: BigNumber }>;

    RewardPaid(
      user: string | null,
      reward: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; reward: BigNumber }
    >;

    RewardsDurationUpdated(
      newDuration: null
    ): TypedEventFilter<[BigNumber], { newDuration: BigNumber }>;

    Staked(
      user: string | null,
      amount: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;

    Withdrawn(
      user: string | null,
      amount: null
    ): TypedEventFilter<
      [string, BigNumber],
      { user: string; amount: BigNumber }
    >;
  };

  estimateGas: {
    DILL(overrides?: CallOverrides): Promise<BigNumber>;

    "DILL()"(overrides?: CallOverrides): Promise<BigNumber>;

    DISTRIBUTION(overrides?: CallOverrides): Promise<BigNumber>;

    "DISTRIBUTION()"(overrides?: CallOverrides): Promise<BigNumber>;

    DURATION(overrides?: CallOverrides): Promise<BigNumber>;

    "DURATION()"(overrides?: CallOverrides): Promise<BigNumber>;

    PICKLE(overrides?: CallOverrides): Promise<BigNumber>;

    "PICKLE()"(overrides?: CallOverrides): Promise<BigNumber>;

    TOKEN(overrides?: CallOverrides): Promise<BigNumber>;

    "TOKEN()"(overrides?: CallOverrides): Promise<BigNumber>;

    TREASURY(overrides?: CallOverrides): Promise<BigNumber>;

    "TREASURY()"(overrides?: CallOverrides): Promise<BigNumber>;

    balanceOf(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    depositAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "depositAll()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    derivedBalance(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "derivedBalance(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    derivedBalances(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "derivedBalances(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    derivedSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "derivedSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    earned(account: string, overrides?: CallOverrides): Promise<BigNumber>;

    "earned(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    exit(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "exit()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getReward(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "getReward()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    getRewardForDuration(overrides?: CallOverrides): Promise<BigNumber>;

    "getRewardForDuration()"(overrides?: CallOverrides): Promise<BigNumber>;

    kick(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "kick(address)"(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    lastTimeRewardApplicable(overrides?: CallOverrides): Promise<BigNumber>;

    "lastTimeRewardApplicable()"(overrides?: CallOverrides): Promise<BigNumber>;

    lastUpdateTime(overrides?: CallOverrides): Promise<BigNumber>;

    "lastUpdateTime()"(overrides?: CallOverrides): Promise<BigNumber>;

    notifyRewardAmount(
      reward: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "notifyRewardAmount(uint256)"(
      reward: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    periodFinish(overrides?: CallOverrides): Promise<BigNumber>;

    "periodFinish()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardPerToken(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardPerToken()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardPerTokenStored(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardPerTokenStored()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewardRate(overrides?: CallOverrides): Promise<BigNumber>;

    "rewardRate()"(overrides?: CallOverrides): Promise<BigNumber>;

    rewards(arg0: string, overrides?: CallOverrides): Promise<BigNumber>;

    "rewards(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    totalSupply(overrides?: CallOverrides): Promise<BigNumber>;

    "totalSupply()"(overrides?: CallOverrides): Promise<BigNumber>;

    userRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "userRewardPerTokenPaid(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    withdraw(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "withdraw(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    withdrawAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;

    "withdrawAll()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    DILL(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "DILL()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    DISTRIBUTION(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "DISTRIBUTION()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    DURATION(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "DURATION()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    PICKLE(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "PICKLE()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    TOKEN(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "TOKEN()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    TREASURY(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "TREASURY()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    balanceOf(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "balanceOf(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "deposit(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    depositAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "depositAll()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    derivedBalance(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "derivedBalance(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    derivedBalances(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "derivedBalances(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    derivedSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "derivedSupply()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    earned(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "earned(address)"(
      account: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    exit(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "exit()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getReward(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "getReward()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    getRewardForDuration(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getRewardForDuration()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    kick(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "kick(address)"(
      account: string,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    lastTimeRewardApplicable(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "lastTimeRewardApplicable()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    lastUpdateTime(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "lastUpdateTime()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    notifyRewardAmount(
      reward: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "notifyRewardAmount(uint256)"(
      reward: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    periodFinish(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "periodFinish()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rewardPerToken(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "rewardPerToken()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rewardPerTokenStored(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "rewardPerTokenStored()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    rewardRate(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "rewardRate()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    rewards(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "rewards(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    totalSupply(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "totalSupply()"(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    userRewardPerTokenPaid(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "userRewardPerTokenPaid(address)"(
      arg0: string,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    withdraw(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "withdraw(uint256)"(
      amount: BigNumberish,
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    withdrawAll(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;

    "withdrawAll()"(
      overrides?: Overrides & { from?: string | Promise<string> }
    ): Promise<PopulatedTransaction>;
  };
}

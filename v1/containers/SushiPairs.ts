import { createContainer } from "unstated-next";
import { ethers, Contract, BigNumber } from "ethers";
import erc20 from "@studydefi/money-legos/erc20";

import { PriceIds, Prices } from "./Prices";
import { Connection } from "./Connection";
import { Contract as MulticallContract } from "ethers-multicall";

export const addresses = {
  pickle: "0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  dai: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  usdt: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  susd: "0x57Ab1ec28D129707052df4dF418D58a2D46d5f51",
  wbtc: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  yfi: "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  mic: "0x368b3a58b5f49392e5c9e4c998cb0bb966752e51",
  mis: "0x4b4d2e899658fb59b1d518b68fe836b100ee8958",
  yvecrv: "0xc5bDdf9843308380375a611c18B50Fb9341f502A",
  sushi: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
  yvboost: "0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a",
  alcx: "0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
  mweth: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  musdt: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  matic: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  mimatic: "0xa3Fa99A148fA48D14Ed51d610c367C61876997F1",
  wusdc: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  cvx: "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B",
  qi: "0x580a84c73811e1839f75d86d75d88cca0c241ff4",
  spell: "0x090185f2135308bad17527004364ebcc2d37e5f6",
  mim: "0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3",
  dino: "0xaa9654becca45b5bdfa5ac646c939c62b527d394",
  tru: "0x4C19596f5aAfF459fA38B0f7eD92F11AE6543784",
  work: "0x6002410dDA2Fb88b4D0dc3c1D562F7761191eA80",

  // OKEx
  cherry: "0x8179D97Eb6488860d816e3EcAFE694a4153F216c",
  wokt: "0x8F8526dbfd6E38E3D8307702cA8469Bae6C56C15",
  okusdc: "0xc946DAf81b08146B1C7A8Da2A851Ddf2B3EAaf85",
  okusdt: "0x382bb369d343125bfb2117af9c149795c6c65c50",
  btck: "0x54e4622DC504176b3BB432dCCAf504569699a7fF",
  ethk: "0xEF71CA2EE68F45B9Ad6F72fbdb33d707b872315C",
  bxh: "0x145ad28a42bf334104610f7836d0945dffb6de63",
  jswap: "0x5fac926bf1e638944bb16fb5b787b5ba4bc85b0a",

  // Arbitrum
  aweth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  asushi: "0xd4d42f0b6def4ce0383636770ef773390d85c61a",
  amim: "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
  aspell: "0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af",
  mpickle: "0x2b88ad57897a8b496595925f43048301c37615da",
  mdai: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
  hnd: "0x10010078a54396f62c96df8532dc2b4847d47ed3",
  dodo: "0x69eb4fa4a2fbd498c257c57ea8b7655a2559a581",
};

interface Token {
  address: string;
  priceId: PriceIds;
  decimals: number;
}

// prettier-ignore
const pickle: Token = { address: addresses.pickle, priceId: "pickle", decimals: 18 };
const weth: Token = { address: addresses.weth, priceId: "eth", decimals: 18 };
const dai: Token = { address: addresses.dai, priceId: "dai", decimals: 18 };
const usdc: Token = { address: addresses.usdc, priceId: "usdc", decimals: 6 };
const usdt: Token = { address: addresses.usdt, priceId: "usdt", decimals: 6 };
const yfi: Token = { address: addresses.yfi, priceId: "yfi", decimals: 18 };
const wbtc: Token = { address: addresses.wbtc, priceId: "wbtc", decimals: 8 };
const mic: Token = { address: addresses.mic, priceId: "mic", decimals: 18 };
const mis: Token = { address: addresses.mis, priceId: "mis", decimals: 18 };
const spell: Token = {
  address: addresses.spell,
  priceId: "spell",
  decimals: 18,
};
const mim: Token = { address: addresses.mim, priceId: "mim", decimals: 18 };
const yvecrv: Token = {
  address: addresses.yvecrv,
  priceId: "yvecrv",
  decimals: 18,
};
const sushi: Token = {
  address: addresses.sushi,
  priceId: "sushi",
  decimals: 18,
};
const yvboost: Token = {
  address: addresses.yvboost,
  priceId: "yvboost",
  decimals: 18,
};
const alcx: Token = {
  address: addresses.alcx,
  priceId: "alcx",
  decimals: 18,
};
const mweth: Token = { address: addresses.mweth, priceId: "eth", decimals: 18 };
const musdt: Token = {
  address: addresses.musdt,
  priceId: "usdt",
  decimals: 18,
};
const matic: Token = {
  address: addresses.matic,
  priceId: "matic",
  decimals: 18,
};
const mimatic: Token = {
  address: addresses.mimatic,
  priceId: "mimatic",
  decimals: 18,
};
const wusdc: Token = { address: addresses.wusdc, priceId: "usdc", decimals: 6 };
const cvx: Token = {
  address: addresses.cvx,
  priceId: "cvx",
  decimals: 18,
};
const qi: Token = {
  address: addresses.qi,
  priceId: "qi",
  decimals: 18,
};
const dino: Token = {
  address: addresses.dino,
  priceId: "dino",
  decimals: 18,
};
const cherry: Token = {
  address: addresses.cherry,
  priceId: "cherry",
  decimals: 18,
};
const wokt: Token = {
  address: addresses.wokt,
  priceId: "wokt",
  decimals: 18,
};
const tru: Token = {
  address: addresses.tru,
  priceId: "tru",
  decimals: 8,
};
const okusdc: Token = {
  address: addresses.okusdc,
  priceId: "usdc",
  decimals: 6,
};
const okusdt: Token = {
  address: addresses.okusdt,
  priceId: "usdt",
  decimals: 18,
};
const ethk: Token = {
  address: addresses.ethk,
  priceId: "eth",
  decimals: 18,
};
const btck: Token = {
  address: addresses.btck,
  priceId: "wbtc",
  decimals: 18,
};
const bxh: Token = {
  address: addresses.bxh,
  priceId: "bxh",
  decimals: 18,
};
const amim: Token = {
  address: addresses.amim,
  priceId: "mim",
  decimals: 18,
};

const aweth: Token = {
  address: addresses.aweth,
  priceId: "eth",
  decimals: 18,
};

const asushi: Token = {
  address: addresses.asushi,
  priceId: "sushi",
  decimals: 18,
};

const aspell: Token = {
  address: addresses.aspell,
  priceId: "spell",
  decimals: 18,
};
const mpickle: Token = {
  address: addresses.mpickle,
  priceId: "pickle",
  decimals: 18,
};
const mdai: Token = {
  address: addresses.mdai,
  priceId: "dai",
  decimals: 18,
};
const hnd: Token = {
  address: addresses.hnd,
  priceId: "hnd",
  decimals: 18,
};
const dodo: Token = {
  address: addresses.dodo,
  priceId: "dodo",
  decimals: 18,
};
const work: Token = {
  address: addresses.work,
  priceId: "work",
  decimals: 18,
};

const jswap: Token = {
  address: addresses.jswap,
  priceId: "jswap",
  decimals: 18,
};

interface PairMap {
  [key: string]: { a: Token; b: Token };
}

export const PAIR_INFO: PairMap = {
  "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f": { a: dai, b: weth },
  "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0": { a: usdc, b: weth },
  "0x06da0fd433C1A5d7a4faa01111c044910A184553": { a: usdt, b: weth },
  "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58": { a: wbtc, b: weth },
  "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C": { a: yfi, b: weth },
  "0xC9cB53B48A2f3A9e75982685644c1870F1405CCb": { a: mic, b: usdt },
  "0x066F3A3B7C8Fa077c71B9184d862ed0A4D5cF3e0": { a: mis, b: usdt },
  "0x10B47177E92Ef9D5C6059055d92DdF6290848991": { a: weth, b: yvecrv },
  "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0": { a: sushi, b: weth },
  "0x9461173740D27311b176476FA27e94C681b1Ea6b": { a: weth, b: yvboost },
  "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8": { a: weth, b: alcx },
  "0xc2755915a85c6f6c1c0f3a86ac8c058f11caa9c9": { a: mweth, b: musdt },
  "0xc4e595acdd7d12fec385e5da5d43160e8a0bac0e": { a: mweth, b: matic },
  "0x160532d2536175d65c03b97b0630a9802c274dad": { a: wusdc, b: mimatic },
  "0xf12BB9dcD40201b5A110e11E38DcddF4d11E6f83": { a: wusdc, b: mimatic },
  "0x74dC9cdCa9a96Fd0B7900e6eb953d1EA8567c3Ce": { a: wusdc, b: mimatic },
  "0x05767d9EF41dC40689678fFca0608878fb3dE906": { a: cvx, b: weth },
  "0x7AfcF11F3e2f01e71B7Cc6b8B5e707E42e6Ea397": { a: qi, b: mimatic },
  "0xb5De0C3753b6E1B4dBA616Db82767F17513E6d4E": { a: spell, b: weth },
  "0x07D5695a24904CC1B6e3bd57cC7780B90618e3c4": { a: mim, b: weth },
  "0x269db91fc3c7fcc275c2e6f22e5552504512811c": { a: pickle, b: weth },
  "0x3324af8417844e70b81555A6D1568d78f4D4Bf1f": { a: wusdc, b: dino },
  "0x9f03309A588e33A239Bf49ed8D68b2D45C7A1F11": { a: mweth, b: dino },
  "0xfCEAAf9792139BF714a694f868A215493461446D": { a: tru, b: weth },
  "0x8E68C0216562BCEA5523b27ec6B9B6e1cCcBbf88": { a: wokt, b: cherry },
  "0x089dedbFD12F2aD990c55A2F1061b8Ad986bFF88": { a: okusdt, b: cherry },
  "0x94E01843825eF85Ee183A711Fa7AE0C5701A731a": { a: btck, b: okusdt },
  "0x407F7a2F61E5bAB199F7b9de0Ca330527175Da93": { a: ethk, b: okusdt },
  "0xF3098211d012fF5380A03D80f150Ac6E5753caA8": { a: wokt, b: okusdt },
  "0xb6fCc8CE3389Aa239B2A5450283aE9ea5df9d1A9": { a: okusdt, b: okusdc },
  "0x04b2C23Ca7e29B71fd17655eb9Bd79953fA79faF": { a: okusdt, b: bxh },
  "0x3799Fb39b7fA01E23338C1C3d652FB1AB6E7D5BC": { a: ethk, b: btck },
  "0x838a7a7f3e16117763c109d98c79ddcd69f6fd6e": { a: btck, b: okusdt },
  "0xeb02a695126b998e625394e43dfd26ca4a75ce2b": { a: ethk, b: okusdt },
  "0x8009edebbbdeb4a3bb3003c79877fcd98ec7fb45": { a: jswap, b: okusdt },
  "0xb6DD51D5425861C808Fd60827Ab6CFBfFE604959": { a: amim, b: aweth },
  "0x8f93Eaae544e8f5EB077A1e09C1554067d9e2CA8": { a: aweth, b: aspell },
  "0x9A8b2601760814019B7E6eE0052E25f1C623D1E6": { a: qi, b: matic },
  "0x57602582eb5e82a197bae4e8b6b80e39abfc94eb": { a: mpickle, b: mdai },
  "0x65E17c52128396443d4A9A61EaCf0970F05F8a20": { a: hnd, b: aweth },
  "0xAb0454B98dAf4A02EA29292E6A8882FB2C787DD4": { a: wusdc, b: work },
};

function useSushiPairs() {
  const { multicallProvider, provider } = Connection.useContainer();
  const { prices } = Prices.useContainer();

  // don't return a function if it's not ready to be used
  if (!multicallProvider || !prices || !provider)
    return { getPairData: null, getPairDataPrefill: null };

  const getPairData = async (pairAddress: string) => {
    // setup contracts
    const { a, b } = PAIR_INFO[pairAddress];
    const tokenA = new Contract(a.address, erc20.abi, provider);
    const tokenB = new Contract(b.address, erc20.abi, provider);
    const pair = new Contract(pairAddress, erc20.abi, provider);

    const [numAInPairBN, numBInPairBN, totalSupplyBN] = await Promise.all([
      tokenA.balanceOf(pairAddress).catch(() => BigNumber.from(0)),
      tokenB.balanceOf(pairAddress).catch(() => BigNumber.from(0)),
      pair.totalSupply(),
    ]);

    // get num of tokens
    const numAInPair = numAInPairBN / Math.pow(10, a.decimals);
    const numBInPair = numBInPairBN / Math.pow(10, b.decimals);

    // get prices
    const priceA = prices[a.priceId];
    const priceB = prices[b.priceId];

    const totalValueOfPair = priceA * numAInPair + priceB * numBInPair;

    const totalSupply = totalSupplyBN / 1e18; // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  // Mainly for multi-call
  const getPairDataPrefill = (
    pairAddress: string,
    numAInPairBN: ethers.BigNumber,
    numBInPairBN: ethers.BigNumber,
    totalSupplyBN: ethers.BigNumber,
  ) => {
    const { a, b } = PAIR_INFO[pairAddress];

    // get num of tokens
    const numAInPair = parseFloat(ethers.utils.formatUnits(numAInPairBN, a.decimals));
    const numBInPair = parseFloat(ethers.utils.formatUnits(numBInPairBN, b.decimals));

    // get prices
    const priceA = prices[a.priceId];
    const priceB = prices[b.priceId];

    const totalValueOfPair = priceA * numAInPair + priceB + numBInPair;
    const totalSupply = parseFloat(ethers.utils.formatEther(totalSupplyBN)); // Uniswap LP tokens are always 18 decimals
    const pricePerToken = totalValueOfPair / totalSupply;

    return { totalValueOfPair, totalSupply, pricePerToken };
  };

  return { getPairData, getPairDataPrefill };
}

export const SushiPairs = createContainer(useSushiPairs);

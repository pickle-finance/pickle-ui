export const PoolType = {
  Curve: "Curve",
  Uniswap: "Uniswap",
  Sushiswap: "Sushiswap",
  Pickle: "Pickle",
};

export const Category = {
  Mirror: "Mirror Farms",
  Basis: "Basis Cash",
};

interface IPoolInfo {
  [key: string]: {
    type: string;
    category?: string;
    jarAddress?: string;
    jarName?: string;
    lpTokenName?: string;
    lpTokenLink?: string;
    lpStakingPool?: string;
    lpToken: string;
    underlyingPool?: string;
    gauge?: string;
    active: boolean;
    poolID?: Number;
  };
}

const SUSHI_MASTERCHEF = "0xc2EdaD668740f1aA35E4D8f227fB8E17dcA888Cd";

export const Pools: IPoolInfo = {
  psCRV: {
    type: PoolType.Curve,
    jarAddress: "0x68d14d66B2B0d6E157c06Dc8Fefa3D8ba0e66a89",
    jarName: "pJar 0a",
    lpTokenName: "sCRV",
    lpTokenLink: "https://www.curve.fi/susdv2/deposit",
    lpToken: "0xC25a3A3b969415c80451098fa907EC722572917F",
    lpStakingPool: "0xDCB6A51eA3CA5d3Fd898Fd6564757c7aAeC3ca92",
    underlyingPool: "0xA5407eAE9Ba41422680e2e00537571bcC53efBfD",
    gauge: "0xA90996896660DEcC6E997655E065b23788857849",
    active: false,
  },
  prenCRV: {
    type: PoolType.Curve,
    jarAddress: "0x2E35392F4c36EBa7eCAFE4de34199b2373Af22ec",
    jarName: "pJar 0b",
    lpTokenName: "renBTCCRV",
    lpTokenLink: "https://www.curve.fi/ren/deposit",
    lpToken: "0x49849C98ae39Fff122806C06791Fa73784FB3675",
    underlyingPool: "0x93054188d876f558f4a66B2EF1d97d16eDf0895B",
    gauge: "0xB1F2cdeC61db658F091671F5f199635aEF202CAC",
    active: true,
  },
  p3CRV: {
    type: PoolType.Curve,
    jarAddress: "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33",
    jarName: "pJar 0c",
    lpTokenName: "3poolCRV",
    lpTokenLink: "https://www.curve.fi/3pool/deposit",
    lpToken: "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    underlyingPool: "0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7",
    gauge: "0xbFcF63294aD7105dEa65aA58F8AE5BE2D9d0952A",
    active: true,
  },
  psteCRV: {
    type: PoolType.Curve,
    jarAddress: "0x77c8a58d940a322aea02dbc8ee4a30350d4239ad",
    jarName: "pJar 0d",
    lpTokenName: "steCRV (ETH-stETH)",
    lpTokenLink: "https://www.curve.fi/steth/deposit",
    lpToken: "0x06325440D014e39736583c165C2963BA99fAf14E",
    underlyingPool: "0xDC24316b9AE028F1497c275EB9192a3Ea0f67022",
    gauge: "0x182B723a58739a9c974cFDB385ceaDb237453c28",
    active: true,
  },
  pSUSHIETHDAI: {
    type: PoolType.Sushiswap,
    jarAddress: "0x55282da27a3a02ffe599f6d11314d239dac89135",
    jarName: "pJar 0.99a",
    lpTokenName: "SLP DAI/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0x6b175474e89094c44da98b954eedeac495271d0f/ETH",
    lpToken: "0xC3D03e4F041Fd4cD388c549Ee2A29a9E5075882f",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIETHUSDC: {
    type: PoolType.Sushiswap,
    jarAddress: "0x8c2d16b7f6d3f989eb4878ecf13d695a7d504e43",
    jarName: "pJar 0.99b",
    lpTokenName: "SLP USDC/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/ETH",
    lpToken: "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIETHUSDT: {
    type: PoolType.Sushiswap,
    jarAddress: "0xa7a37ae5cb163a3147de83f15e15d8e5f94d6bce",
    jarName: "pJar 0.99c",
    lpTokenName: "SLP USDT/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/ETH/0xdac17f958d2ee523a2206206994597c13d831ec7",
    lpToken: "0x06da0fd433C1A5d7a4faa01111c044910A184553",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIETHWBTC: {
    type: PoolType.Sushiswap,
    jarAddress: "0xde74b6c547bd574c3527316a2ee30cd8f6041525",
    jarName: "pJar 0.99d",
    lpTokenName: "SLP WBTC/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/ETH",
    lpToken: "0xCEfF51756c56CeFFCA006cD410B03FFC46dd3a58",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIETHYFI: {
    type: PoolType.Sushiswap,
    jarAddress: "0x3261D9408604CC8607b687980D40135aFA26FfED",
    jarName: "pJar 0.99e",
    lpTokenName: "SLP YFI/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/ETH",
    lpToken: "0x088ee5007C98a9677165D78dD2109AE4a3D04d0C",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIMISUSDT: {
    type: PoolType.Sushiswap,
    jarAddress: "0x0FAA189afE8aE97dE1d2F01E471297678842146d",
    jarName: "pJar 0.99h",
    lpTokenName: "SLP MIS/USDT",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0x4b4D2e899658FB59b1D518b68fe836B100ee8958/0xdAC17F958D2ee523a2206206994597C13D831ec7",
    lpToken: "0x066F3A3B7C8Fa077c71B9184d862ed0A4D5cF3e0",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: false,
  },
  pSUSHIETHYVECRV: {
    type: PoolType.Sushiswap,
    jarAddress: "0x5eff6d166d66bacbc1bf52e2c54dd391ae6b1f48",
    jarName: "pJar 0.99i",
    lpTokenName: "SLP YVECRV/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0xc5bddf9843308380375a611c18b50fb9341f502a/ETH",
    lpToken: "0x10B47177E92Ef9D5C6059055d92DdF6290848991",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIETH: {
    type: PoolType.Sushiswap,
    jarAddress: "0xECb520217DccC712448338B0BB9b08Ce75AD61AE",
    jarName: "pJar 0.99q",
    lpTokenName: "SLP SUSHI/ETH",
    lpTokenLink:
      "https://exchange.sushiswapclassic.org/#/add/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2/ETH",
    lpToken: "0x795065dCc9f64b5614C407a6EFDC400DA6221FB0",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pSUSHIETHALCX: {
    type: PoolType.Sushiswap,
    jarAddress: "0x9eb0aAd5Bb943D3b2F7603Deb772faa35f60aDF9",
    jarName: "pJar 0.99x",
    lpTokenName: "SLP ALCX/ETH",
    lpTokenLink:
      "https://app.sushi.com/add/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/0xdbdb4d16eda451d0503b854cf79d55697f90c8df",
    lpToken: "0xC3f279090a47e80990Fe3a9c30d24Cb117EF91a8",
    lpStakingPool: SUSHI_MASTERCHEF,
    active: true,
  },
  pUNIETHDAI: {
    type: PoolType.Uniswap,
    jarAddress: "0xCffA068F1E44D98D3753966eBd58D4CFe3BB5162",
    jarName: "pJar 0.99x",
    lpTokenName: "UNI DAI/ETH",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x6b175474e89094c44da98b954eedeac495271d0f/ETH",
    lpToken: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
    lpStakingPool: "0xa1484c3aa22a66c62b77e0ae78e15258bd0cb711",
    active: false,
  },
  pUNIETHUSDC: {
    type: PoolType.Uniswap,
    jarAddress: "0x53Bf2E62fA20e2b4522f05de3597890Ec1b352C6",
    jarName: "pJar 0.69b",
    lpTokenName: "UNI USDC/ETH",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/ETH",
    lpToken: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
    lpStakingPool: "0x7fba4b8dc5e7616e59622806932dbea72537a56b",
    active: false,
  },
  pUNIETHUSDT: {
    type: PoolType.Uniswap,
    jarAddress: "0x09FC573c502037B149ba87782ACC81cF093EC6ef",
    jarName: "pJar 0.69c",
    lpTokenName: "UNI USDT/ETH",
    lpTokenLink:
      "https://app.uniswap.org/#/add/ETH/0xdac17f958d2ee523a2206206994597c13d831ec7",
    lpToken: "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852",
    lpStakingPool: "0x6c3e4cb2e96b01f4b866965a91ed4437839a121a",
    active: false,
  },
  pUNIETHWBTC: {
    type: PoolType.Uniswap,
    jarAddress: "0xc80090AA05374d336875907372EE4ee636CBC562",
    jarName: "pJar 0.69d",
    lpTokenName: "UNI WBTC/ETH",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x2260fac5e5542a773aa44fbcfedf7c193bc2c599/ETH",
    lpToken: "0xBb2b8038a1640196FbE3e38816F3e67Cba72D940",
    lpStakingPool: "0xCA35e32e7926b96A9988f61d510E038108d8068e",
    active: false,
  },
  pUNIBACDAI: {
    type: PoolType.Uniswap,
    category: Category.Basis,
    jarAddress: "0x2350fc7268F3f5a6cC31f26c38f706E41547505d",
    jarName: "pJar 0.99f",
    lpTokenName: "UNI BAC/DAI",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x3449FC1Cd036255BA1EB19d65fF4BA2b8903A69a/0x6B175474E89094C44Da98b954EedeAC495271d0F",
    lpToken: "0xd4405F0704621DBe9d4dEA60E128E0C3b26bddbD",
    lpStakingPool: "0x7E7aE8923876955d6Dcb7285c04065A1B9d6ED8c",
    poolID: 0,
    active: true,
  },
  pUNIBASDAI: {
    type: PoolType.Uniswap,
    category: Category.Basis,
    jarAddress: "0x748712686a78737DA0b7643DF78Fdf2778dC5944",
    jarName: "pJar 0.99j",
    lpTokenName: "UNI BAS/DAI",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x106538cc16f938776c7c180186975bca23875287/0x6B175474E89094C44Da98b954EedeAC495271d0F",
    lpToken: "0x3E78F2E7daDe07ea685F8612F00477FD97162F1e",
    lpStakingPool: "0x5859Adb05988946B9d08dcE2E12ae29af58120C0",
    poolID: 1,
    active: true,
  },
  pUNIMIRUST: {
    type: PoolType.Uniswap,
    category: Category.Mirror,
    jarAddress: "0x3bcd97dca7b1ced292687c97702725f37af01cac",
    jarName: "pJar 0.99k",
    lpTokenName: "UNI MIR/UST",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x09a3ecafa817268f77be1283176b946c4ff2e608/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
    lpToken: "0x87dA823B6fC8EB8575a235A824690fda94674c88",
    lpStakingPool: "0x5d447Fc0F8965cED158BAB42414Af10139Edf0AF",
    active: true,
  },
  pUNIMTSLAUST: {
    type: PoolType.Uniswap,
    category: Category.Mirror,
    jarAddress: "0xaFB2FE266c215B5aAe9c4a9DaDC325cC7a497230",
    jarName: "pJar 0.99l",
    lpTokenName: "UNI MTSLA/UST",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x21cA39943E91d704678F5D00b6616650F066fD63/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
    lpToken: "0x5233349957586A8207c52693A959483F9aeAA50C",
    lpStakingPool: "0x43DFb87a26BA812b0988eBdf44e3e341144722Ab",
    active: true,
  },
  pUNIMAAPLUST: {
    type: PoolType.Uniswap,
    category: Category.Mirror,
    jarAddress: "0xF303B35D5bCb4d9ED20fB122F5E268211dEc0EBd",
    jarName: "pJar 0.99m",
    lpTokenName: "UNI MAAPL/UST",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0xd36932143F6eBDEDD872D5Fb0651f4B72Fd15a84/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
    lpToken: "0xB022e08aDc8bA2dE6bA4fECb59C6D502f66e953B",
    lpStakingPool: "0x735659C8576d88A2Eb5C810415Ea51cB06931696",
    active: true,
  },
  pUNIMQQQUST: {
    type: PoolType.Uniswap,
    category: Category.Mirror,
    jarAddress: "0x7C8de3eE2244207A54b57f45286c9eE1465fee9f",
    jarName: "pJar 0.99n",
    lpTokenName: "UNI MQQQ/UST",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x13B02c8dE71680e71F0820c996E4bE43c2F57d15/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
    lpToken: "0x9E3B47B861B451879d43BBA404c35bdFb99F0a6c",
    lpStakingPool: "0xc1d2ca26A59E201814bF6aF633C3b3478180E91F",
    active: true,
  },
  pUNIMSLVUST: {
    type: PoolType.Uniswap,
    category: Category.Mirror,
    jarAddress: "0x1ed1fD33b62bEa268e527A622108fe0eE0104C07",
    jarName: "pJar 0.99o",
    lpTokenName: "UNI MSLV/UST",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x9d1555d8cB3C846Bb4f7D5B1B1080872c3166676/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
    lpToken: "0x860425bE6ad1345DC7a3e287faCBF32B18bc4fAe",
    lpStakingPool: "0xDB278fb5f7d4A7C3b83F80D18198d872Bbf7b923",
    active: true,
  },
  pUNIMBABAUST: {
    type: PoolType.Uniswap,
    category: Category.Mirror,
    jarAddress: "0x1CF137F651D8f0A4009deD168B442ea2E870323A",
    jarName: "pJar 0.99p",
    lpTokenName: "UNI MBABA/UST",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x56aA298a19C93c6801FDde870fA63EF75Cc0aF72/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD",
    lpToken: "0x676Ce85f66aDB8D7b8323AeEfe17087A3b8CB363",
    lpStakingPool: "0x769325E8498bF2C2c3cFd6464A60fA213f26afcc",
    active: true,
  },
  pUNIFEITRIBE: {
    type: PoolType.Uniswap,
    jarAddress: "0xC1513C1b0B359Bc5aCF7b772100061217838768B",
    jarName: "pJar 0.99r",
    lpTokenName: "UNI FEI/TRIBE",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x956f47f50a910163d8bf957cf5846d573e7f87ca/0xc7283b66eb1eb5fb86327f08e1b5816b0720212b",
    lpToken: "0x9928e4046d7c6513326cCeA028cD3e7a91c7590A",
    lpStakingPool: "0x18305DaAe09Ea2F4D51fAa33318be5978D251aBd",
    active: true,
  },
  pUNIETHLUSD: {
    type: PoolType.Uniswap,
    jarAddress: "0x927e3bCBD329e89A8765B52950861482f0B227c4",
    jarName: "pJar 0.99u",
    lpTokenName: "UNI ETH/LUSD",
    lpTokenLink:
      "https://app.uniswap.org/#/add/0x5f98805A4E8be255a32880FDeC7F6728C6568bA0/ETH",
    lpToken: "0xF20EF17b889b437C151eB5bA15A47bFc62bfF469",
    lpStakingPool: "0xd37a77E71ddF3373a79BE2eBB76B6c4808bDF0d5",
    active: true,
  },
  pickleETH: {
    type: PoolType.Pickle,
    lpToken: "0xdc98556ce24f007a5ef6dc1ce96322d65832a819",
    gauge: "0xdc98556ce24f007a5ef6dc1ce96322d65832a819",
    active: true,
  },
};

export const GAUGE_PROXY = "0x4ed7c70f96b99c776995fb64377f0d4ab3b0e1c1";

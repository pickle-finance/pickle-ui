import { createContainer } from "unstated-next";

import { useFetchFarms } from "./Farms/useFetchFarms";
import { useWithReward } from "./Farms/useWithReward";
import { useUniV2Apy } from "./Farms/useUniV2Apy";
import { useJarFarmApy } from "./Farms/useJarFarmApy";

interface IFarmInfo {
  [key: string]: { tokenName: string; poolName: string; tokenLink: string; };
}

export const FarmInfo: IFarmInfo = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819": {
    tokenName: "UNI PICKLE/ETH",
    poolName: "Pickle Power",
    tokenLink: "https://app.uniswap.org/#/add/0x429881672B9AE42b8EbA0E26cD9C73711b891Ca5/ETH",
  },
  "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11": {
    tokenName: "UNIV2 DAI/ETH LP",
    poolName: "Dilly Dai",
    tokenLink: "https://app.uniswap.org/#/add/0x6B175474E89094C44Da98b954EedeAC495271d0F/ETH",
  },
  "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc": {
    tokenName: "UNIV2 USDC/ETH LP",
    poolName: "Cucumber Coins",
    tokenLink: "https://app.uniswap.org/#/add/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/ETH",
  },
  "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852": {
    tokenName: "UNIV2 USDT/ETH LP",
    poolName: "Tasty Tether",
    tokenLink: "https://app.uniswap.org/#/add/0xdAC17F958D2ee523a2206206994597C13D831ec7/ETH"
  },
  "0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c": {
    tokenName: "UNIV2 sUSD/ETH LP",
    poolName: "Salty Synths",
    tokenLink: "https://app.uniswap.org/#/add/0x57Ab1ec28D129707052df4dF418D58a2D46d5f51/ETH"
  },
  "0xf79Ae82DCcb71ca3042485c85588a3E0C395D55b": {
    tokenName: "pUNIDAI",
    poolName: "pUNIDAI Pool",
  },
  "0x46206E9BDaf534d057be5EcF231DaD2A1479258B": {
    tokenName: "pUNIUSDC",
    poolName: "pUNIUSDC Pool",
  },
  "0x3a41AB1e362169974132dEa424Fb8079Fd0E94d8": {
    tokenName: "pUNIUSDT",
    poolName: "pUNIUSDT Pool",
  },
  "0x2385D31f1EB3736bE0C3629E6f03C4b3cd997Ffd": {
    tokenName: "psCRV",
    poolName: "psCRV Pool",
  },
  "0xCffA068F1E44D98D3753966eBd58D4CFe3BB5162": {
    tokenName: "pUNIDAI v2",
    poolName: "pUNIDAI v2",
  },
  "0x53Bf2E62fA20e2b4522f05de3597890Ec1b352C6": {
    tokenName: "pUNIUSDC v2",
    poolName: "pUNIUSDC v2",
  },
  "0x09FC573c502037B149ba87782ACC81cF093EC6ef": {
    tokenName: "pUNIUSDT v2",
    poolName: "pUNIUSDT v2",
  },
  "0xC1513C1b0B359Bc5aCF7b772100061217838768B": {
    tokenName: "pUNIV2 FEI/TRIBE",
    poolName: "pUNIV2 FEI/TRIBE",
    tokenLink: "https://app.uniswap.org/#/add/0x956F47F50A910163D8BF957Cf5846D573E7f87CA/ETH"
  },
  "0x3Bcd97dCA7b1CED292687c97702725F37af01CaC": {
    tokenName: "pUNIV2 MIR/UST",
    poolName: "pUNIV2 MIR/UST",
    tokenLink: "https://app.uniswap.org/#/add/0x09a3EcAFa817268f77BE1283176B946C4ff2E608/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD"
  },
  "0xaFB2FE266c215B5aAe9c4a9DaDC325cC7a497230": {
    tokenName: "pUNIV2 MTSLA/UST",
    poolName: "pUNIV2 MTSLA/UST",
    tokenLink: "https://app.uniswap.org/#/add/0x21cA39943E91d704678F5D00b6616650F066fD63/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD"
  },
  "0xF303B35D5bCb4d9ED20fB122F5E268211dEc0EBd": {
    tokenName: "pUNIV2 MAAPL/UST",
    poolName: "pUNIV2 MAAPL/UST",
    tokenLink: "https://app.uniswap.org/#/add/0xd36932143F6eBDEDD872D5Fb0651f4B72Fd15a84/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD"
  },
  "0x7C8de3eE2244207A54b57f45286c9eE1465fee9f": {
    tokenName: "pUNIV2 MQQQ/UST",
    poolName: "pUNIV2 MQQQ/UST",
    tokenLink: "https://app.uniswap.org/#/add/0x13B02c8dE71680e71F0820c996E4bE43c2F57d15/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD"
  },
  "0x1ed1fD33b62bEa268e527A622108fe0eE0104C07": {
    tokenName: "pUNIV2 MSLV/UST",
    poolName: "pUNIV2 MSLV/UST",
    tokenLink: "https://app.uniswap.org/#/add/0x9d1555d8cB3C846Bb4f7D5B1B1080872c3166676/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD"
  },
  "0x1CF137F651D8f0A4009deD168B442ea2E870323A": {
    tokenName: "pUNIV2 MBABA/UST",
    poolName: "pUNIV2 MBABA/UST",
    tokenLink: "https://app.uniswap.org/#/add/0x56aA298a19C93c6801FDde870fA63EF75Cc0aF72/0xa47c8bf37f92aBed4A126BDA807A7b7498661acD"
  },
  "0x68d14d66B2B0d6E157c06Dc8Fefa3D8ba0e66a89": {
    tokenName: "psCRV v2",
    poolName: "psCRV v2",
    tokenLink: "https://curve.fi/susdv2/deposit"
  },
  "0xc80090AA05374d336875907372EE4ee636CBC562": {
    tokenName: "pUNIWBTC",
    poolName: "pUNIWBTC",
  },
  "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33": {
    tokenName: "p3CRV",
    poolName: "p3CRV",
    tokenLink: "https://curve.fi/3pool/deposit"
  },
  "0x2E35392F4c36EBa7eCAFE4de34199b2373Af22ec": {
    tokenName: "prenBTC CRV",
    poolName: "prenBTC CRV",
  },
  "0x6949Bb624E8e8A90F87cD2058139fcd77D2F3F87": {
    tokenName: "pDAI",
    poolName: "pDAI",
  },
  "0x55282dA27a3a02ffe599f6D11314D239dAC89135": {
    tokenName: "pSLP DAI",
    poolName: "pSLP DAI",
    tokenLink: "https://app.sushi.com/add/0x6b175474e89094c44da98b954eedeac495271d0f/ETH"
  },
  "0x8c2D16B7F6D3F989eb4878EcF13D695A7d504E43": {
    tokenName: "pSLP USDC",
    poolName: "pSLP USDC",
    tokenLink: "https://app.sushi.com/add/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/ETH"
  },
  "0xa7a37aE5Cb163a3147DE83F15e15D8E5f94D6bCE": {
    tokenName: "pSLP USDT",
    poolName: "pSLP USDT",
    tokenLink: "https://app.sushi.com/add/0xdAC17F958D2ee523a2206206994597C13D831ec7/ETH"
  },
  "0xde74b6c547bd574c3527316a2eE30cd8F6041525": {
    tokenName: "pSLP WBTC",
    poolName: "pSLP WBTC",
    tokenLink: "https://app.sushi.com/add/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/ETH"
  },
  "0x3261D9408604CC8607b687980D40135aFA26FfED": {
    tokenName: "pSLP YFI",
    poolName: "pSLP YFI",
    tokenLink: "https://app.sushi.com/add/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/ETH"
  },
  "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48": {
    tokenName: "pSLP yveCRV",
    poolName: "Back Scratcher",
    tokenLink: "https://app.sushi.com/add/0xc5bDdf9843308380375a611c18B50Fb9341f502A/ETH"
  },
  "0xECb520217DccC712448338B0BB9b08Ce75AD61AE": {
    tokenName: "pSLP SUSHI",
    poolName: "pSLP SUSHI",
    tokenLink: "https://app.sushi.com/#/add/0x6b3595068778dd592e39a122f4f5a5cf09c90fe2/ETH"
  },
  "0xC66583Dd4E25b3cfc8D881F6DbaD8288C7f5Fd30": {
    tokenName: "pSLP MIC/USDT",
    poolName: "pSLP MIC/USDT",
  },
  "0x748712686a78737DA0b7643DF78Fdf2778dC5944": {
    tokenName: "pUNI BASv2/DAI",
    poolName: "pUNI BASv2/DAI",
  },
  "0x2350fc7268F3f5a6cC31f26c38f706E41547505d": {
    tokenName: "pUNI BAC/DAI",
    poolName: "pUNI BAC/DAI",
  },
  "0x77C8A58D940a322Aea02dBc8EE4A30350D4239AD": {
    tokenName: "stEthCrv",
    poolName: "stETH-ETH",
    tokenLink: "https://curve.fi/steth/deposit"
  },
  "0x0FAA189afE8aE97dE1d2F01E471297678842146d": {
    tokenName: "pSLP MIS/USDT",
    poolName: "pSLP MIS/USDT",
  },
  "0x927e3bCBD329e89A8765B52950861482f0B227c4": {
    tokenName: "pUNIV2 LUSD/ETH",
    poolName: "pUNIV2 LUSD/ETH",
    tokenLink: "https://app.uniswap.org/#/add/0x5f98805A4E8be255a32880FDeC7F6728C6568bA0/ETH"
  },
  "0x9eb0aAd5Bb943D3b2F7603Deb772faa35f60aDF9": {
    tokenName: "pSLP ALCX/ETH",
    poolName: "pSLP ALCX/ETH",
    tokenLink: "https://app.sushi.com/#/add/ETH/0xdbdb4d16eda451d0503b854cf79d55697f90c8df"
  },
};

function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { uniV2FarmsWithApy } = useUniV2Apy(farmsWithReward);
  const { jarFarmWithApy } = useJarFarmApy(farmsWithReward);

  const uniFarms = uniV2FarmsWithApy?.map((farm) => {
    const { tokenName, poolName, tokenLink } = FarmInfo[farm.lpToken];
    return {
      ...farm,
      tokenName,
      tokenLink,
      poolName,
    };
  });

  const jarFarms = jarFarmWithApy?.map((farm) => {
    const { tokenName, poolName, tokenLink } = FarmInfo[farm.lpToken];
    return {
      ...farm,
      tokenName,
      tokenLink,
      poolName,
    };
  });

  return {
    farms: uniFarms && jarFarms ? [...uniFarms, ...jarFarms] : null,
  };
}

export const Farms = createContainer(useFarms);

import { createContainer } from "unstated-next";

import { useFetchFarms } from "./Farms/useFetchFarms";
import { useWithReward } from "./Farms/useWithReward";
import { useUniV2Apy } from "./Farms/useUniV2Apy";
import { useJarFarmApy } from "./Farms/useJarFarmApy";

interface IFarmInfo {
  [key: string]: { tokenName: string; poolName: string };
}

export const FarmInfo: IFarmInfo = {
  "0xdc98556Ce24f007A5eF6dC1CE96322d65832A819": {
    tokenName: "UNI PICKLE/ETH",
    poolName: "Pickle Power",
  },
  "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11": {
    tokenName: "UNIV2 DAI/ETH LP",
    poolName: "Dilly Dai",
  },
  "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc": {
    tokenName: "UNIV2 USDC/ETH LP",
    poolName: "Cucumber Coins",
  },
  "0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852": {
    tokenName: "UNIV2 USDT/ETH LP",
    poolName: "Tasty Tether",
  },
  "0xf80758aB42C3B07dA84053Fd88804bCB6BAA4b5c": {
    tokenName: "UNIV2 sUSD/ETH LP",
    poolName: "Salty Synths",
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
  },
  "0x3Bcd97dCA7b1CED292687c97702725F37af01CaC": {
    tokenName: "pUNIV2 MIR/UST",
    poolName: "pUNIV2 MIR/UST",
  },
  "0xaFB2FE266c215B5aAe9c4a9DaDC325cC7a497230": {
    tokenName: "pUNIV2 MTSLA/UST",
    poolName: "pUNIV2 MTSLA/UST",
  },
  "0xF303B35D5bCb4d9ED20fB122F5E268211dEc0EBd": {
    tokenName: "pUNIV2 MAAPL/UST",
    poolName: "pUNIV2 MAAPL/UST",
  },
  "0x7C8de3eE2244207A54b57f45286c9eE1465fee9f": {
    tokenName: "pUNIV2 MQQQ/UST",
    poolName: "pUNIV2 MQQQ/UST",
  },
  "0x1ed1fD33b62bEa268e527A622108fe0eE0104C07": {
    tokenName: "pUNIV2 MSLV/UST",
    poolName: "pUNIV2 MSLV/UST",
  },
  "0x1CF137F651D8f0A4009deD168B442ea2E870323A": {
    tokenName: "pUNIV2 MBABA/UST",
    poolName: "pUNIV2 MBABA/UST",
  },
  "0x68d14d66B2B0d6E157c06Dc8Fefa3D8ba0e66a89": {
    tokenName: "psCRV v2",
    poolName: "psCRV v2",
  },
  "0xc80090AA05374d336875907372EE4ee636CBC562": {
    tokenName: "pUNIWBTC",
    poolName: "pUNIWBTC",
  },
  "0x1BB74b5DdC1f4fC91D6f9E7906cf68bc93538e33": {
    tokenName: "p3CRV",
    poolName: "p3CRV",
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
  },
  "0x8c2D16B7F6D3F989eb4878EcF13D695A7d504E43": {
    tokenName: "pSLP USDC",
    poolName: "pSLP USDC",
  },
  "0xa7a37aE5Cb163a3147DE83F15e15D8E5f94D6bCE": {
    tokenName: "pSLP USDT",
    poolName: "pSLP USDT",
  },
  "0xde74b6c547bd574c3527316a2eE30cd8F6041525": {
    tokenName: "pSLP WBTC",
    poolName: "pSLP WBTC",
  },
  "0x3261D9408604CC8607b687980D40135aFA26FfED": {
    tokenName: "pSLP YFI",
    poolName: "pSLP YFI",
  },
  "0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48": {
    tokenName: "pSLP yveCRV",
    poolName: "Back Scratcher",
  },
  "0xCeD67a187b923F0E5ebcc77C7f2F7da20099e378": {
    tokenName: "pSLP yvBOOST",
    poolName: "Back Scratcher",
  },
  "0xECb520217DccC712448338B0BB9b08Ce75AD61AE": {
    tokenName: "pSLP SUSHI",
    poolName: "pSLP SUSHI",
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
  },
  "0x0FAA189afE8aE97dE1d2F01E471297678842146d": {
    tokenName: "pSLP MIS/USDT",
    poolName: "pSLP MIS/USDT",
  },
  "0x927e3bCBD329e89A8765B52950861482f0B227c4": {
    tokenName: "pUNIV2 LUSD/ETH",
    poolName: "pUNIV2 LUSD/ETH",
  },
  "0x9eb0aAd5Bb943D3b2F7603Deb772faa35f60aDF9": {
    tokenName: "pSLP ALCX/ETH",
    poolName: "pSLP ALCX/ETH",
  },
  "0xEB801AB73E9A2A482aA48CaCA13B1954028F4c94": {
    tokenName: "pYearnUSDCv2",
    poolName: "Pickled Yearn USDC",
  },
  "0x4fFe73Cf2EEf5E8C8E0E10160bCe440a029166D2": {
    tokenName: "pYearnLusdCRV",
    poolName: "Pickled Yearn LUSD",
  },
  "0x729C6248f9B1Ce62B3d5e31D4eE7EE95cAB32dfD": {
    tokenName: "pYearnFraxCRV",
    poolName: "Pickled Yearn FRAX",
  },
  "0xDCfAE44244B3fABb5b351b01Dc9f050E589cF24F": {
    tokenName: "pSUSHICVXETH",
    poolName: "pSUSHICVXETH",
  },
  "0x65B2532474f717D5A8ba38078B78106D56118bbb": {
    tokenName: "pLQTY",
    poolName: "Pickled LQTY",
  },
  "0xe6487033F5C8e2b4726AF54CA1449FEC18Bd1484": {
    tokenName: "pSADDLED4",
    poolName: "Saddle D4",
  },
  "0x1Bf62aCb8603Ef7F3A0DFAF79b25202fe1FAEE06": {
    tokenName: "pMIM3CRV",
    poolName: "Abracadabra Mim3Crv",
  },
  "0xdB84a6A48881545E8595218b7a2A3c9bd28498aE": {
    tokenName: "pSPELLETH",
    poolName: "Abracadabra SPELLETH",
  },
  "0x993f35FaF4AEA39e1dfF28f45098429E0c87126C": {
    tokenName: "pMIMETH",
    poolName: "Abracadabra MIMETH",
  },
  "0xeb8174F94FDAcCB099422d9A816B8E17d5e393E3": {
    tokenName: "pUNIV2 FOX/ETH",
    poolName: "pUNIV2 FOX/ETH",
  },
  "0x1d92e1702D7054f74eAC3a9569AeB87FC93e101D": {
    tokenName: "pSLP TRU/ETH",
    poolName: "pSLP TRU/ETH",
  },
};

function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  // const { uniV2FarmsWithApy } = useUniV2Apy(farmsWithReward);
  // const { jarFarmWithApy } = useJarFarmApy(farmsWithReward)

  const farms = farmsWithReward
    ?.filter(
      (x) =>
        x.lpToken != "0x73feA839bEad0E4100B6e5f59Fb6E896Ad69910f" &&
        x.lpToken != "0x45F7fa97BD0e0C212A844BAea35876C7560F465B",
    )
    .map((farm) => {
      const { tokenName, poolName } = FarmInfo[farm.lpToken];
      return {
        ...farm,
        tokenName,
        poolName,
        apy: 0,
        usdPerToken: 0,
        totalValue: 0,
        valueStakedInFarm: 0,
        numTokensInPool: 0,
      };
    });

  return {
    farms,
  };
}

export const Farms = createContainer(useFarms);

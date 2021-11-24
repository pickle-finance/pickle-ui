import { createContainer } from "unstated-next";

import { useWithReward } from "./MiniFarms/useWithReward";
import { useJarFarmApy } from "./Farms/useJarFarmApy";
import { useFetchFarms } from "./Farms/useFetchFarms";
import { useMaticJarApy } from "./MiniFarms/useMaticJarApy";

interface IFarmInfo {
  [key: string]: { tokenName: string; poolName: string };
}

export const FarmInfo: IFarmInfo = {
  "0x9eD7e3590F2fB9EEE382dfC55c71F9d3DF12556c": {
    tokenName: "pCLP USDC/WETH",
    poolName: "pCLP USDC/WETH",
  },
  "0x7512105DBb4C0E0432844070a45B7EA0D83a23fD": {
    tokenName: "pCLP PICKLE/MUST",
    poolName: "pCLP PICKLE/MUST",
  },
  "0x91bcc0BBC2ecA760e3b8A79903CbA53483A7012C": {
    tokenName: "pCLP MATIC/MUST",
    poolName: "pCLP MATIC/MUST",
  },
  "0x0519848e57Ba0469AA5275283ec0712c91e20D8E": {
    tokenName: "pAaveDAI",
    poolName: "pAaveDAI",
  },
  "0x261b5619d85B710f1c2570b65ee945975E2cC221": {
    tokenName: "am3CRV",
    poolName: "am3CRV",
  },
  "0x80aB65b1525816Ffe4222607EDa73F86D211AC95": {
    tokenName: "pSLP ETH/USDT",
    poolName: "pSLP ETH/USDT",
  },
  "0xd438Ba7217240a378238AcE3f44EFaaaF8aaC75A": {
    tokenName: "pSLP ETH/MATIC",
    poolName: "pSLP ETH/MATIC",
  },
  "0xf12BB9dcD40201b5A110e11E38DcddF4d11E6f83": {
    tokenName: "pQLP MAI (old)",
    poolName: "pQLP MAI (old)",
  },
  "0x74dC9cdCa9a96Fd0B7900e6eb953d1EA8567c3Ce": {
    tokenName: "pQLP MAI",
    poolName: "pQLP MAI",
  },
  "0xd06a56c864C80e4cC76A2eF778183104BF0c848d": {
    tokenName: "pQLP QI",
    poolName: "pQLP QI",
  },
  "0xe5BD4954Bd6749a8E939043eEDCe4C62b41CC6D0": {
    tokenName: "pQLP QI/MATIC",
    poolName: "pQLP QI/MATIC",
  },
  "0xE484Ed97E19F6B649E78db0F37D173C392F7A1D9": {
    tokenName: "IS3USD",
    poolName: "IS3USD",
  },
  "0xC8450922d18793AD97C401D65BaE8A83aE5353a8": {
    tokenName: "pSLP DINO/USDC",
    poolName: "pSLP DINO/USDC",
  },
  "0x1cCDB8152Bb12aa34e5E7F6C9c7870cd6C45E37F": {
    tokenName: "pQLP DINO/WETH",
    poolName: "pQLP DINO/WETH",
  },
  "0x1D35e4348826857eaFb22739d4e494C0337cb427": {
    tokenName: "pSLP PICKLE/DAI",
    poolName: "pSLP PICKLE/DAI",
  },
  "0xD170F0a8629a6F7A1E330D5fC455d96E54c09675": {
    tokenName: "pSLP WORK/USDC",
    poolName: "pSLP WORK/USDC",
  },

  // OKEx
  "0xC3f393FB40F8Cc499C1fe7FA5781495dc6FAc9E9": {
    tokenName: "pCLP CHE/OKT",
    poolName: "pCLP CHE/OKT",
  },
  "0xe75c8805f9970c7547255059A22d14001d3D7b94": {
    tokenName: "pCLP CHE/USDT",
    poolName: "pCLP CHE/USDT",
  },
  "0x4a19C49Ee3233A2AE103487f3699D70573EC2371": {
    tokenName: "pCLP ETHK/USDT",
    poolName: "pCLP ETHK/USDT",
  },
  "0x7072B80D4E259F26b82C2C4e53cDBFB71450195e": {
    tokenName: "pCLP OKT/USDT",
    poolName: "pCLP OKT/USDT",
  },
  "0xD120C607911105Bc99B510749d102Dc63a20bbb4": {
    tokenName: "pJLP JF/USDT",
    poolName: "pJLP JF/USDT",
  },
  "0x5be52aDF0C54598F0fA6f433B398492748Ecd588": {
    tokenName: "pJLP BTCKUSDT",
    poolName: "pJLP BTCKUSDT",
  },
  "0x668d30c30Ffb182964516f549528E06633B48295": {
    tokenName: "pJLP ETHKUSDT",
    poolName: "pJLP ETHKUSDT",
  },
  
  // Arbitrum
  "0x94fEadE0D3D832E4A05d459eBeA9350c6cDd3bCa": {
    tokenName: "pSLP MIM/ETH",
    poolName: "pSLP MIM/ETH",
  },
  "0x9Cae10143d7316dF417413C43b79Fb5b44Fa85e2": {
    tokenName: "pSLP SPELL/ETH",
    poolName: "pSLP SPELL/ETH",
  },
  "0x973B669eF8c1459f7cb685bf7D7bCD4150977504": {
    tokenName: "Abracadabra MIM2CRV",
    poolName: "Abracadabra MIM2CRV",
  },
  "0x8E93d85AFa9E6A092676912c3EB00f46C533a07C": {
    tokenName: "Curve Tricrypto",
    poolName: "Curve Tricrypto",
  },
  "0x4d622C1f40A83C6FA2c0E441AE393e6dE61E7dD2": {
    tokenName: "pDodo HND/ETH",
    poolName: "pDodo HND/ETH",
  },
};

function useFarms() {
  const { rawFarms } = useFetchFarms();
  const { farmsWithReward } = useWithReward(rawFarms);
  const { jarFarmWithApy } = useJarFarmApy(farmsWithReward);
  const { jarFarmWithMaticApy } = useMaticJarApy(jarFarmWithApy);

  const jarFarms = jarFarmWithMaticApy
    ?.map((farm) => {
      if (!FarmInfo[farm.lpToken]) return null;
      const { tokenName, poolName } = FarmInfo[farm.lpToken];
      return {
        ...farm,
        tokenName,
        poolName,
      };
    })
    .filter((x) => x);

  return {
    farms: jarFarms,
  };
}

export const MiniFarms = createContainer(useFarms);

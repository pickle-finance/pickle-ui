import type { AddEthereumChainParameter } from '@web3-react/types'

const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
}

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
}

interface BasicChainInformation {
  urls: string[]
  name: string
}

interface ExtendedChainInformation extends BasicChainInformation {
  nativeCurrency: AddEthereumChainParameter['nativeCurrency']
  blockExplorerUrls: AddEthereumChainParameter['blockExplorerUrls']
}

function isExtendedChainInformation(
  chainInformation: BasicChainInformation | ExtendedChainInformation
): chainInformation is ExtendedChainInformation {
  return !!(chainInformation as ExtendedChainInformation).nativeCurrency
}

export function getAddChainParameters(chainId: number): AddEthereumChainParameter | number {
  const chainInformation = CHAINS[chainId]
  if (isExtendedChainInformation(chainInformation)) {
    return {
      chainId,
      chainName: chainInformation.name,
      nativeCurrency: chainInformation.nativeCurrency,
      rpcUrls: chainInformation.urls,
      blockExplorerUrls: chainInformation.blockExplorerUrls,
    }
  } else {
    return chainId
  }
}

// TODO add the rest of the chains from pfcore
export const CHAINS: { [chainId: number]: BasicChainInformation | ExtendedChainInformation } = {
  1: {
    urls: [
    //   process.env.infura ?? undefined,
      'https://cloudflare-eth.com',
    ].filter((url) => url !== undefined),
    name: 'Mainnet',
  },
  // Optimism
  10: {
    urls: [
    //   process.env.infuraKey ? `https://optimism-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://mainnet.optimism.io',
    ].filter((url) => url !== undefined),
    name: 'Optimism',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://optimistic.etherscan.io'],
  },
  // Arbitrum
  42161: {
    urls: [
    //   process.env.infuraKey ? `https://arbitrum-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://arb1.arbitrum.io/rpc',
    ].filter((url) => url !== undefined),
    name: 'Arbitrum One',
    nativeCurrency: ETH,
    blockExplorerUrls: ['https://arbiscan.io'],
  },
  // Polygon
  137: {
    urls: [
    //   process.env.infuraKey ? `https://polygon-mainnet.infura.io/v3/${process.env.infuraKey}` : undefined,
      'https://polygon-rpc.com',
    ].filter((url) => url !== undefined),
    name: 'Polygon Mainnet',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://polygonscan.com'],
  },
}

export const URLS: { [chainId: number]: string[] } = Object.keys(CHAINS).reduce<{ [chainId: number]: string[] }>(
  (accumulator, chainId) => {
    const validURLs: string[] = CHAINS[Number(chainId)].urls

    if (validURLs.length) {
      accumulator[Number(chainId)] = validURLs
    }

    return accumulator
  },
  {}
)
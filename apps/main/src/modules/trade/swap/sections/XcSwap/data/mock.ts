export type XcAsset = {
  key: string
  symbol: string
  name: string
  decimals: number
  logo: string
  balance: string
  balanceUsd: string
}

export type XcChain = {
  key: string
  name: string
  logo: string
  addressValidator: (addr: string) => boolean
}

export type XcChainAssetPair = {
  chain: XcChain
  asset: XcAsset
}

export type XcUserData = {
  sourceBalance: string
  sourceUsd: string
}

const nonEmpty = (addr: string) => addr.trim().length > 0

const hydration: XcChain = {
  key: "hydration",
  name: "Hydration",
  logo: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  addressValidator: nonEmpty,
}

const zcash: XcChain = {
  key: "zcash",
  name: "Zcash",
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
  addressValidator: nonEmpty,
}

const bitcoin: XcChain = {
  key: "bitcoin",
  name: "Bitcoin",
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  addressValidator: nonEmpty,
}

const near: XcChain = {
  key: "near",
  name: "NEAR",
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
  addressValidator: nonEmpty,
}

const hdx: XcAsset = {
  key: "0",
  symbol: "HDX",
  name: "Hydration",
  decimals: 12,
  logo: "https://cdn.jsdelivr.net/gh/galacticcouncil/intergalactic-asset-metadata@latest/v2/polkadot/2034/assets/0/icon.svg",
  balance: "1234.5678",
  balanceUsd: "61.23",
}

const zec: XcAsset = {
  key: "zec",
  symbol: "ZEC",
  name: "Zcash",
  decimals: 8,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
  balance: "0",
  balanceUsd: "0",
}

const btc: XcAsset = {
  key: "btc",
  symbol: "BTC",
  name: "Bitcoin",
  decimals: 8,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  balance: "0",
  balanceUsd: "0",
}

const nearAsset: XcAsset = {
  key: "near",
  symbol: "NEAR",
  name: "NEAR",
  decimals: 24,
  logo: "https://s2.coinmarketcap.com/static/img/coins/64x64/6535.png",
  balance: "0",
  balanceUsd: "0",
}

export const sourceChainAssetPairs: XcChainAssetPair[] = [
  { chain: hydration, asset: hdx },
]

export const destChainAssetPairs: XcChainAssetPair[] = [
  { chain: zcash, asset: zec },
  { chain: bitcoin, asset: btc },
  { chain: near, asset: nearAsset },
]

export const userData: XcUserData = {
  sourceBalance: "1234.5678",
  sourceUsd: "61.23",
}

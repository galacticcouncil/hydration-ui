import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain } from "@galacticcouncil/xcm-core"
import { PROVIDERS } from "api/provider"
import { wssToHttps } from "sections/lending/utils/utils"
import { groupBy } from "utils/rx"

export enum ChainId {
  hydration = 222222,
  hydration_testnet = 333333,
}

export type ExplorerLinkBuilderProps = {
  tx?: string
  address?: string
}

export type ExplorerLinkBuilderConfig = {
  baseUrl: string
  addressPrefix?: string
  txPrefix?: string
}

export type NetworkConfig = {
  name: string
  displayName?: string
  privateJsonRPCUrl?: string // private rpc will be used for rpc queries inside the client. normally has private api key and better rate
  privateJsonRPCWSUrl?: string
  publicJsonRPCUrl: readonly string[] // public rpc used if not private found, and used to add specific network to wallets if user don't have them. Normally with slow rates
  publicJsonRPCWSUrl?: string
  // protocolDataUrl: string;
  // https://github.com/aave/aave-api
  ratesHistoryApiUrl?: string
  // cachingServerUrl?: string;
  // cachingWSServerUrl?: string;
  baseUniswapAdapter?: string
  /**
   * When this is set withdrawals will automatically be unwrapped
   */
  wrappedBaseAssetSymbol: string
  baseAssetSymbol: string
  // needed for configuring the chain on metemask when it doesn't exist yet
  baseAssetDecimals: number
  // usdMarket?: boolean;
  // function returning a link to etherscan et al
  explorerLink: string
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string
  // set this to show faucets and similar
  isTestnet?: boolean
  // get's automatically populated on fork networks
  isFork?: boolean
  networkLogoPath: string
  // contains the forked off chainId
  underlyingChainId?: number
  bridge?: {
    icon: string
    name: string
    url: string
  }
}

const hydration = (chainsMap.get("hydration") as EvmParachain).client.chain

export type BaseNetworkConfig = Omit<NetworkConfig, "explorerLinkBuilder">

const providers = groupBy(PROVIDERS, ({ dataEnv }) => dataEnv)

const testnetProviders = providers.testnet.map(({ url }) => wssToHttps(url))
const mainnetProviders = providers.mainnet.map(({ url }) => wssToHttps(url))

export const networkConfigs: Record<string, BaseNetworkConfig> = {
  [ChainId.hydration]: {
    name: "Hydration",
    publicJsonRPCUrl: mainnetProviders,
    baseUniswapAdapter: "0x0",
    baseAssetSymbol: "",
    wrappedBaseAssetSymbol: "",
    baseAssetDecimals: 18,
    explorerLink: hydration.blockExplorers?.default?.url ?? "",
    isTestnet: false,
    networkLogoPath: "https://app.hydration.net/favicon/apple-touch-icon.png",
  },
  [ChainId.hydration_testnet]: {
    name: "Hydration Testnet",
    publicJsonRPCUrl: testnetProviders,
    baseUniswapAdapter: "0x0",
    baseAssetSymbol: "",
    wrappedBaseAssetSymbol: "",
    baseAssetDecimals: 18,
    explorerLink: "https://explorer.nice.hydration.cloud",
    isTestnet: true,
    networkLogoPath: "https://app.hydration.net/favicon/apple-touch-icon.png",
  },
} as const

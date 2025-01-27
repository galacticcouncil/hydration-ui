import { ReactNode } from "react"
import {
  AaveV3HydrationMainnet,
  AaveV3HydrationTestnet,
} from "sections/lending/ui-config/addresses"
import { ChainId } from "sections/lending/ui-config/networksConfig"

export type MarketDataType = {
  v3?: boolean
  marketTitle: string
  market: CustomMarket
  // the network the market operates on
  chainId: ChainId
  enabledFeatures?: {
    liquiditySwap?: boolean
    staking?: boolean
    governance?: boolean
    faucet?: boolean
    collateralRepay?: boolean
    incentives?: boolean
    permissions?: boolean
    debtSwitch?: boolean
    withdrawAndSwitch?: boolean
    switch?: boolean
  }
  isFork?: boolean
  permissionComponent?: ReactNode
  disableCharts?: boolean
  subgraphUrl?: string
  addresses: {
    LENDING_POOL_ADDRESS_PROVIDER: string
    LENDING_POOL: string
    WETH_GATEWAY?: string
    SWAP_COLLATERAL_ADAPTER?: string
    REPAY_WITH_COLLATERAL_ADAPTER?: string
    DEBT_SWITCH_ADAPTER?: string
    WITHDRAW_SWITCH_ADAPTER?: string
    FAUCET?: string
    PERMISSION_MANAGER?: string
    WALLET_BALANCE_PROVIDER: string
    L2_ENCODER?: string
    UI_POOL_DATA_PROVIDER: string
    UI_INCENTIVE_DATA_PROVIDER?: string
    COLLECTOR?: string
    V3_MIGRATOR?: string
    GHO_TOKEN_ADDRESS?: string
    GHO_UI_DATA_PROVIDER?: string
  }
  /**
   * https://www.hal.xyz/ has integrated aave for healtfactor warning notification
   * the integration doesn't follow aave market naming & only supports a subset of markets.
   * When a halIntegration is specified a link to hal will be displayed on the ui.
   */
  halIntegration?: {
    URL: string
    marketName: string
  }
}
export enum CustomMarket {
  hydration_v3 = "hydration_v3",
  hydration_testnet_v3 = "hydration_testnet_v3",
}

export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType
} = {
  [CustomMarket.hydration_v3]: {
    marketTitle: "Hydration",
    market: CustomMarket.hydration_v3,
    v3: true,
    chainId: ChainId.hydration,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER:
        AaveV3HydrationMainnet.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3HydrationMainnet.POOL,
      WETH_GATEWAY: AaveV3HydrationMainnet.WETH_GATEWAY,
      FAUCET: AaveV3HydrationMainnet.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3HydrationMainnet.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3HydrationMainnet.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER:
        AaveV3HydrationMainnet.UI_INCENTIVE_DATA_PROVIDER,
      GHO_TOKEN_ADDRESS: AaveV3HydrationMainnet.GHO_TOKEN_ADDRESS,
      GHO_UI_DATA_PROVIDER: AaveV3HydrationMainnet.GHO_UI_DATA_PROVIDER,
      COLLECTOR: AaveV3HydrationMainnet.COLLECTOR,
    },
  },
  [CustomMarket.hydration_testnet_v3]: {
    marketTitle: "Hydration Testnet",
    market: CustomMarket.hydration_testnet_v3,
    v3: true,
    chainId: ChainId.hydration_testnet,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER:
        AaveV3HydrationTestnet.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3HydrationTestnet.POOL,
      WETH_GATEWAY: AaveV3HydrationTestnet.WETH_GATEWAY,
      FAUCET: AaveV3HydrationTestnet.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3HydrationTestnet.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3HydrationTestnet.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER:
        AaveV3HydrationTestnet.UI_INCENTIVE_DATA_PROVIDER,
      GHO_TOKEN_ADDRESS: AaveV3HydrationTestnet.GHO_TOKEN_ADDRESS,
      GHO_UI_DATA_PROVIDER: AaveV3HydrationTestnet.GHO_UI_DATA_PROVIDER,
      COLLECTOR: AaveV3HydrationMainnet.COLLECTOR,
    },
  },
} as const

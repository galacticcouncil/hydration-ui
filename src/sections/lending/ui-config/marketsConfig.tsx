import { ChainId } from "@aave/contract-helpers"
import {
  AaveV2Ethereum,
  AaveV3Ethereum,
  AaveV3Sepolia,
} from "@bgd-labs/aave-address-book"
import { ReactNode } from "react"
import { AaveV3Hydration } from "sections/lending/ui-config/addresses"

// Enable for premissioned market
// import { PermissionView } from 'sections/lending/components/transactions/FlowCommons/PermissionView';
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
  // v3 test networks, all v3.0.1
  hydration_v3 = "hydration_v3",
  proto_sepolia_v3 = "proto_sepolia_v3",
  // v3 mainnets
  proto_mainnet_v3 = "proto_mainnet_v3",
  // v2
  proto_mainnet = "proto_mainnet",
}

// @ts-ignore
export const marketsData: {
  [key in keyof typeof CustomMarket]: MarketDataType
} = {
  [CustomMarket.hydration_v3]: {
    marketTitle: "Hydration",
    market: CustomMarket.hydration_v3,
    v3: true,
    chainId: 222222 as ChainId,
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Hydration.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Hydration.POOL,
      WETH_GATEWAY: AaveV3Hydration.WETH_GATEWAY,
      FAUCET: AaveV3Hydration.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3Hydration.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Hydration.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Hydration.UI_INCENTIVE_DATA_PROVIDER,
      GHO_TOKEN_ADDRESS: AaveV3Hydration.GHO_TOKEN_ADDRESS,
      GHO_UI_DATA_PROVIDER: AaveV3Hydration.GHO_UI_DATA_PROVIDER,
    },
  },
  [CustomMarket.proto_sepolia_v3]: {
    marketTitle: "Ethereum Sepolia",
    market: CustomMarket.proto_sepolia_v3,
    v3: true,
    chainId: ChainId.sepolia,
    enabledFeatures: {
      faucet: true,
    },
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Sepolia.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Sepolia.POOL,
      WETH_GATEWAY: AaveV3Sepolia.WETH_GATEWAY,
      FAUCET: AaveV3Sepolia.FAUCET,
      WALLET_BALANCE_PROVIDER: AaveV3Sepolia.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Sepolia.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Sepolia.UI_INCENTIVE_DATA_PROVIDER,
      GHO_TOKEN_ADDRESS: "0xc4bF5CbDaBE595361438F8c6a187bDc330539c60",
      GHO_UI_DATA_PROVIDER: "0x69B9843A16a6E9933125EBD97659BA3CCbE2Ef8A",
    },
  },
  [CustomMarket.proto_mainnet_v3]: {
    marketTitle: "Ethereum",
    market: CustomMarket.proto_mainnet_v3,
    chainId: ChainId.mainnet,
    v3: true,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: true,
      incentives: true,
      withdrawAndSwitch: true,
      debtSwitch: true,
      switch: true,
    },
    subgraphUrl: "https://api.thegraph.com/subgraphs/name/aave/protocol-v3",
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV3Ethereum.POOL,
      WETH_GATEWAY: AaveV3Ethereum.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER:
        AaveV3Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV3Ethereum.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV3Ethereum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV3Ethereum.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV3Ethereum.COLLECTOR,
      GHO_TOKEN_ADDRESS: AaveV3Ethereum.ASSETS.GHO.UNDERLYING,
      GHO_UI_DATA_PROVIDER: AaveV3Ethereum.UI_GHO_DATA_PROVIDER,
      WITHDRAW_SWITCH_ADAPTER: AaveV3Ethereum.WITHDRAW_SWAP_ADAPTER,
      DEBT_SWITCH_ADAPTER: AaveV3Ethereum.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: "https://app.hal.xyz/recipes/aave-v3-track-health-factor",
      marketName: "aavev3",
    },
  },
  [CustomMarket.proto_mainnet]: {
    marketTitle: "Ethereum",
    market: CustomMarket.proto_mainnet,
    chainId: ChainId.mainnet,
    enabledFeatures: {
      governance: true,
      staking: true,
      liquiditySwap: true,
      collateralRepay: true,
      incentives: true,
      debtSwitch: true,
      switch: true,
    },
    subgraphUrl: "https://api.thegraph.com/subgraphs/name/aave/protocol-v2",
    addresses: {
      LENDING_POOL_ADDRESS_PROVIDER: AaveV2Ethereum.POOL_ADDRESSES_PROVIDER,
      LENDING_POOL: AaveV2Ethereum.POOL,
      WETH_GATEWAY: AaveV2Ethereum.WETH_GATEWAY,
      REPAY_WITH_COLLATERAL_ADAPTER:
        AaveV2Ethereum.REPAY_WITH_COLLATERAL_ADAPTER,
      SWAP_COLLATERAL_ADAPTER: AaveV2Ethereum.SWAP_COLLATERAL_ADAPTER,
      WALLET_BALANCE_PROVIDER: AaveV2Ethereum.WALLET_BALANCE_PROVIDER,
      UI_POOL_DATA_PROVIDER: AaveV2Ethereum.UI_POOL_DATA_PROVIDER,
      UI_INCENTIVE_DATA_PROVIDER: AaveV2Ethereum.UI_INCENTIVE_DATA_PROVIDER,
      COLLECTOR: AaveV2Ethereum.COLLECTOR,
      V3_MIGRATOR: AaveV2Ethereum.MIGRATION_HELPER,
      DEBT_SWITCH_ADAPTER: AaveV2Ethereum.DEBT_SWAP_ADAPTER,
    },
    halIntegration: {
      URL: "https://app.hal.xyz/recipes/aave-track-your-health-factor",
      marketName: "aavev2",
    },
  },
} as const

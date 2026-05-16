// Public API of the vendored waku-broadcaster-client (Hydration fork).
//
// Mirrors upstream `packages/common/src/index.ts` minus the transact path
// (see README.md "What is intentionally NOT vendored").
export * from "./waku-broadcaster-client.js"
export * from "./models/index.js"
export * from "./fees/broadcaster-fee-cache.js"
export * from "./search/best-broadcaster.js"
export {
  HYDRATION_CHAIN_ID,
  networkForChain as hydrationNetworkForChain,
} from "./shared-models-shim.js"

// Re-export the shared-models types consumers need (Chain, SelectedBroadcaster,
// BroadcasterConnectionStatus, …). We surface them from the vendored package
// so `import { Chain } from '@galacticcouncil/railgun-waku-broadcaster-client'`
// works without the caller pulling shared-models separately.
export type {
  Chain,
  SelectedBroadcaster,
  CachedTokenFee,
  BroadcasterFeeMessageData,
  Network,
} from "@railgun-community/shared-models"
export {
  BroadcasterConnectionStatus,
  ChainType,
  NetworkName,
} from "@railgun-community/shared-models"

// Vendored verbatim from upstream
// `packages/common/src/waku/waku-topics.ts`. Topics are keyed by
// chain.type/chain.id, so the Hydration chain (`0:222222`) gets its own
// fee and transact topics without any further mapping.
import { Chain } from "../shared-models-shim.js"

export const contentTopics = {
  default: () => "/railgun/v2/default/json",
  fees: (chain: Chain) => `/railgun/v2/${chain.type}-${chain.id}-fees/json`,
  transact: (chain: Chain) =>
    `/railgun/v2/${chain.type}-${chain.id}-transact/json`,
  transactResponse: (chain: Chain) =>
    `/railgun/v2/${chain.type}-${chain.id}-transact-response/json`,
  metrics: () => `/railgun/v2/metrics/json`,
  encrypted: (topic: string) => `/railgun/v2/encrypted-${topic}/json`,
}

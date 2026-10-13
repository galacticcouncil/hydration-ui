import { chainsMap } from "@galacticcouncil/xc-cfg"

import { stripTrailingSlash } from "./helpers"

export const nearblocks = {
  tx: (chainKey: string, txHash: string): string => {
    const chain = chainsMap.get(chainKey)
    if (!chain?.explorer) return ""
    return `${stripTrailingSlash(chain.explorer)}/txns/${txHash}`
  },
}

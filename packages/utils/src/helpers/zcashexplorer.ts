import { chainsMap } from "@galacticcouncil/xc-cfg"

import { stripTrailingSlash } from "./helpers"

export const zcashexplorer = {
  tx: (chainKey: string, txId: string): string => {
    const chain = chainsMap.get(chainKey)
    if (!chain?.explorer) return ""
    return `${stripTrailingSlash(chain.explorer)}/transactions/${txId}`
  },
}

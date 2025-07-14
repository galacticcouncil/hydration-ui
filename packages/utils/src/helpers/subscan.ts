import { chainsMap } from "@galacticcouncil/xcm-cfg"

import { createQueryString, getRdnsFromUrl, stringEquals } from "./helpers"

type SubscanLinkPath = "tx" | "account" | "block"

export const subscan = {
  rdns: "io.subscan",
  link: (
    chainKey: string,
    path: SubscanLinkPath,
    data: string | number,
    query: Record<string, string | number> = {},
  ): string => {
    const chain = chainsMap.get(chainKey)
    if (
      !chain?.explorer ||
      !stringEquals(getRdnsFromUrl(chain.explorer), subscan.rdns)
    ) {
      return ""
    }
    return `${chain.explorer}/${path}/${data}${createQueryString(query)}`
  },
  tx: (chainKey: string, txHash: string) => {
    return subscan.link(chainKey, "tx", txHash)
  },
  account: (chainKey: string, address: string) => {
    return subscan.link(chainKey, "account", address)
  },
  block: (chainKey: string, blockHashOrNumber: string | number) => {
    return subscan.link(chainKey, "block", blockHashOrNumber)
  },
  blockEvent: (chainKey: string, blockNumber: number, indexInBlock: number) => {
    return subscan.link(chainKey, "block", blockNumber, {
      tab: "event",
      event: `${blockNumber}-${indexInBlock}`,
    })
  },
}

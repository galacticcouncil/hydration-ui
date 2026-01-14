import { chainsMap } from "@galacticcouncil/xc-cfg"

import {
  createQueryString,
  getRdnsFromUrl,
  stringEquals,
  stripTrailingSlash,
} from "./helpers"

type SubscanLinkPath = "tx" | "account" | "block"

const SUBSCAN_API_PROXY_URL =
  "https://galacticcouncil.squids.live/hydration-pools:unified-prod/api/proxy/subscan"

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
    return `${stripTrailingSlash(chain.explorer)}/${path}/${data}${createQueryString(query)}`
  },
  api: (path: string, query: Record<string, string | number> = {}) => {
    return `${SUBSCAN_API_PROXY_URL}/${path}${createQueryString(query)}`
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

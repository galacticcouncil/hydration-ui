import { createQueryString } from "./helpers"

type WormholescanLinkPath = "tx" | "account" | "block"

const WORMHOLESCAN_URL = "https://wormholescan.io"
const WORMHOLESCAN_API_URL = "https://api.wormholescan.io/api/v1"

export const wormholescan = {
  api: (path: string, query: Record<string, string | number> = {}) => {
    return `${WORMHOLESCAN_API_URL}/${path}${createQueryString(query)}`
  },
  link: (path: WormholescanLinkPath, data: string | number): string => {
    return `${WORMHOLESCAN_URL}/#/${path}/${data}`
  },
  tx: (txHash: string) => {
    return wormholescan.link("tx", txHash)
  },
}

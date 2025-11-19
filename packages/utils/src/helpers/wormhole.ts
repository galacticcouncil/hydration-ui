type WormholescanLinkPath = "tx" | "account" | "block"

const WORMHOLESCAN_URL = "https://wormholescan.io"

export const wormholescan = {
  link: (path: WormholescanLinkPath, data: string | number): string => {
    return `${WORMHOLESCAN_URL}/#/${path}/${data}`
  },
  tx: (txHash: string) => {
    return wormholescan.link("tx", txHash)
  },
}

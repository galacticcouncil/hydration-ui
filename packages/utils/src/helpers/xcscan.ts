type XcScanLinkPath = "tx"

const XCSCAN_URL = "https://xcscan.io"

export const xcscan = {
  link: (path: XcScanLinkPath, data: string): string => {
    return `${XCSCAN_URL}/${path}/#${data}`
  },
  tx: (correlationId: string): string => {
    return xcscan.link("tx", correlationId)
  },
}

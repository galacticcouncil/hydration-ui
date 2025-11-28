type SnowbridgescanLinkPath = "history"

const SNOWBRIDGESCAN_URL = "https://app.snowbridge.network"

export const snowbridgescan = {
  link: (path: SnowbridgescanLinkPath, data: string | number): string => {
    return `${SNOWBRIDGESCAN_URL}/${path}#${data}`
  },
  tx: (messageId: string) => {
    return snowbridgescan.link("history", messageId)
  },
}

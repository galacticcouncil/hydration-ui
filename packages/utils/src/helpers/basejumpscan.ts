const BASEJUMPSCAN_URL = "https://bjscan-api.play.hydration.cloud"

export const basejumpscan = {
  baseUrl: BASEJUMPSCAN_URL,
  transfers: `${BASEJUMPSCAN_URL}/api/transfers`,
  link: (data: string | number): string => {
    return `${BASEJUMPSCAN_URL}/${encodeURIComponent(data)}`
  },
  tx: (id: string) => {
    return basejumpscan.link(id)
  },
}

const TRANSFERSCAN_URL = "https://scan.play.hydration.cloud"

export const transferscan = {
  /** A transfer's page, by the scan's transfer id. */
  transfer: (id: string): string => {
    return `${TRANSFERSCAN_URL}/transfer/${encodeURIComponent(id)}`
  },
}

const INTENTSCAN_URL = "https://explorer-intent.play.hydration.cloud"

export const intentscan = {
  baseUrl: INTENTSCAN_URL,
  order: (sequence: string | number): string => {
    return `${INTENTSCAN_URL}/orders/${encodeURIComponent(sequence)}`
  },
}

const INTENTSCAN_URL = "https://scan.play.hydration.cloud"
const INTENTSCAN_API_URL = "https://intents.scan.play.hydration.cloud"

export const intentscan = {
  apiUrl: INTENTSCAN_API_URL,
  order: (sequence: string | number): string => {
    return `${INTENTSCAN_URL}/order/${encodeURIComponent(sequence)}`
  },
}

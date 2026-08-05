const INTENTSCAN_URL = "https://scan-api.play.hydration.cloud"

export const intentscan = {
  baseUrl: INTENTSCAN_URL,
  intent: (intentId: string | number): string => {
    return `${INTENTSCAN_URL}/intents/${encodeURIComponent(intentId)}`
  },
}

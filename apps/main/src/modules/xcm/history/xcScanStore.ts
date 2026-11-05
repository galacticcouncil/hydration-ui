import {
  OcelloidsHttpClient,
  OcelloidsSseClient,
  XcStore,
} from "@galacticcouncil/xc-scan"

const apiUrl = "https://api.ocelloids.net"
const apiKey =
  "eyJhbGciOiJFZERTQSIsImtpZCI6Im92SFVDU3hRM0NiYkJmc01STVh1aVdjQkNZcDVydmpvamphT2J4dUxxRDQ9In0.ewogICJpc3MiOiAiYXBpLm9jZWxsb2lkcy5uZXQiLAogICJqdGkiOiAiMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLAogICJzdWIiOiAicHVibGljQG9jZWxsb2lkcyIKfQo.qKSfxo6QYGxzv40Ox7ec6kpt2aVywKmhpg6lue4jqmZyY6y3SwfT-DyX6Niv-ine5k23E0RKGQdm_MbtyPp9CA"

export const xcScanHttpClient = new OcelloidsHttpClient(apiUrl, apiKey)
export const xcScanSseClient = new OcelloidsSseClient(apiUrl)

export const xcStore = new XcStore(xcScanHttpClient, xcScanSseClient)

export async function queryXcScanMetadata(
  body: object,
  signal?: AbortSignal,
): Promise<unknown> {
  const response = await fetch(`${apiUrl}/query/steward`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal,
  })
  if (!response.ok) {
    throw new Error(`XCScan metadata unavailable: ${response.status}`)
  }
  return response.json()
}

import {
  OcelloidsHttpClient,
  OcelloidsSseClient,
  XcStore,
} from "@galacticcouncil/xc-scan"

const apiUrl = "https://api.ocelloids.net"
const apiKey =
  "eyJhbGciOiJFZERTQSIsImtpZCI6Im92SFVDU3hRM0NiYkJmc01STVh1aVdjQkNZcDVydmpvamphT2J4dUxxRDQ9In0.ewogICJpc3MiOiAiYXBpLm9jZWxsb2lkcy5uZXQiLAogICJqdGkiOiAiMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAiLAogICJzdWIiOiAicHVibGljQG9jZWxsb2lkcyIKfQo.qKSfxo6QYGxzv40Ox7ec6kpt2aVywKmhpg6lue4jqmZyY6y3SwfT-DyX6Niv-ine5k23E0RKGQdm_MbtyPp9CA"

const httpClient = new OcelloidsHttpClient(apiUrl, apiKey)
const sseClient = new OcelloidsSseClient(apiUrl)

export const xcStore = new XcStore(httpClient, sseClient)

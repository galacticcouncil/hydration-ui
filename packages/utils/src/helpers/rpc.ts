import { capitalize } from "remeda"

export type PingResponse = {
  url: string
  timestamp: number
  ping: number | null
  blockNumber: number | null
}

export function parseHydrationRpcName(url: string): string {
  const { rawName } =
    /^wss?:\/\/(?<rawName>[\w.-]+)\.hydration\.cloud/.exec(url)?.groups ?? {}

  if (!rawName) {
    return ""
  }

  const formatted = rawName
    .split(".")
    .map((word) => capitalize(word))
    .join(" ")

  return formatted
}

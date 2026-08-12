import { createWsClient } from "polkadot-api/ws"

import { Papi } from "@/providers/rpcProvider"

const BLOCK_TIME_SAMPLE_SIZE = 50
export const TARGET_BLOCK_TIME_MS = 2000

type WsPolkadotClient = ReturnType<typeof createWsClient>

export const getAverageBlockTimeMs = async (
  papiClient: WsPolkadotClient,
  papi: Papi,
): Promise<number> => {
  try {
    const { hash, number } = await papiClient.getFinalizedBlock()
    const pastNumber = number - BLOCK_TIME_SAMPLE_SIZE

    if (pastNumber > 0) {
      const pastHash = await papiClient._request<string>("chain_getBlockHash", [
        pastNumber,
      ])

      const [now, past] = await Promise.all([
        papi.query.Timestamp.Now.getValue({ at: hash }),
        papi.query.Timestamp.Now.getValue({ at: pastHash }),
      ])

      const averageMs = (Number(now) - Number(past)) / BLOCK_TIME_SAMPLE_SIZE

      if (averageMs > 0) return Math.round(averageMs)
    }
  } catch {
    // fall through and use target block time
  }

  return TARGET_BLOCK_TIME_MS
}

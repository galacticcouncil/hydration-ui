import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { useApiPromise } from "utils/network"
import { QUERY_KEYS } from "utils/queryKeys"

export function useTimestamp(blockNumber?: u32 | BigNumber) {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.timestamp(blockNumber), () =>
    getTimestamp(api, blockNumber),
  )
}

export async function getTimestamp(
  api: ApiPromise,
  blockNumber?: u32 | BigNumber,
) {
  if (blockNumber != null) {
    const blockHash = await api.rpc.chain.getBlockHash(blockNumber.toString())
    const apiAt = await api.at(blockHash)
    const now = await apiAt.query.timestamp.now()
    return now.toNumber()
  }

  const now = await api.query.timestamp.now()
  return now.toNumber()
}

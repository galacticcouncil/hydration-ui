import { ApiPromise } from "@polkadot/api"
import { getApiIds } from "api/consts"
import { getTotalIssuance } from "api/totalIssuance"
import { getTokenBalance } from "api/balances"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { getAssetMeta } from "api/assetMeta"

const getLRNATotalIssuance = async (api: ApiPromise) => {
  const apiIds = await getApiIds(api)()
  const hubId = apiIds?.hubId
  const meta = await getAssetMeta(api, hubId)()

  const shiftBy = meta.data ? meta.data.decimals.neg().toNumber() : 0

  const totalIssuance = await getTotalIssuance(api, hubId)()
  return totalIssuance.total.shiftedBy(shiftBy).dp(0)
}

const getLRNAOmnipoolBalance = async (api: ApiPromise) => {
  const address = import.meta.env.VITE_OMNIPOOL_ADDR
  const apiIds = await getApiIds(api)()
  const hubId = apiIds?.hubId
  const meta = await getAssetMeta(api, hubId)()

  const shiftBy = meta.data ? meta.data.decimals.neg().toNumber() : 0

  const balance = await getTokenBalance(api, address, hubId)()
  return balance.total.shiftedBy(shiftBy).dp(0)
}

export const useLRNATotalIssuance = (api: ApiPromise) =>
  useQuery(QUERY_KEYS.LRNATotalIssuance(), () => getLRNATotalIssuance(api), {
    enabled: !!api,
    refetchInterval: 60000,
  })
export const useLRNAOmnipoolBalance = (api: ApiPromise) =>
  useQuery(
    QUERY_KEYS.LRNAOmnipoolBalance(),
    () => getLRNAOmnipoolBalance(api),
    { enabled: !!api, refetchInterval: 60000 },
  )

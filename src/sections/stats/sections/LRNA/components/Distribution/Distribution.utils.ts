import { ApiPromise } from "@polkadot/api"
import { getApiIds } from "api/consts"
import { getTotalIssuance } from "api/totalIssuance"
import { getTokenBalance } from "api/balances"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { getAssetMeta } from "api/assetMeta"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import BigNumber from "bignumber.js"

const getLRNAMeta = async (api: ApiPromise) => {
  const apiIds = await getApiIds(api)()
  const hubId = apiIds?.hubId

  return getAssetMeta(api, hubId)()
}

const getLRNATotalIssuance = async (api: ApiPromise) => {
  const meta = await getLRNAMeta(api)
  const shiftBy = meta.data ? meta.data.decimals.neg().toNumber() : 0

  const totalIssuance = await getTotalIssuance(api, meta.id)()
  return totalIssuance.total.shiftedBy(shiftBy).dp(0)
}

const getLRNAOmnipoolBalance = async (api: ApiPromise) => {
  const meta = await getLRNAMeta(api)
  const shiftBy = meta.data ? meta.data.decimals.neg().toNumber() : 0

  const balance = await getTokenBalance(
    api,
    OMNIPOOL_ACCOUNT_ADDRESS,
    meta.id,
  )()
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

export const useLRNAMeta = (api: ApiPromise) =>
  useQuery(QUERY_KEYS.LRNAMeta(), () => getLRNAMeta(api), { enabled: !!api })

export const makePercent = (value?: BigNumber, total?: BigNumber) =>
  value && total ? value.div(total).multipliedBy(100) : undefined

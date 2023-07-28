import { ApiPromise } from "@polkadot/api"
import { getTotalIssuance } from "api/totalIssuance"
import { getTokenBalance } from "api/balances"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { OMNIPOOL_ACCOUNT_ADDRESS, useApiPromise } from "utils/api"
import BigNumber from "bignumber.js"
import { getLRNAMeta } from "api/assetMeta"
import { formatValue } from "../../StatsLRNA.utils"
import { REFETCH_INTERVAL } from "utils/constants"
import { isApiLoaded } from '../../../../../../utils/helpers'

const getLRNATotalIssuance = async (api: ApiPromise) => {
  const meta = await getLRNAMeta(api)
  const totalIssuance = await getTotalIssuance(api, meta.id)()

  return formatValue(totalIssuance.total, meta)
}

const getLRNAOmnipoolBalance = async (api: ApiPromise) => {
  const meta = await getLRNAMeta(api)
  const balance = await getTokenBalance(
    api,
    OMNIPOOL_ACCOUNT_ADDRESS,
    meta.id,
  )()

  return formatValue(balance.total, meta)
}

export const useLRNATotalIssuance = () => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.LRNATotalIssuance(),
    () => getLRNATotalIssuance(api),
    {
      enabled: !!isApiLoaded(api),
      refetchInterval: REFETCH_INTERVAL,
    },
  )
}

export const useLRNAOmnipoolBalance = () => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.LRNAOmnipoolBalance(),
    () => getLRNAOmnipoolBalance(api),
    { enabled: !!isApiLoaded(api), refetchInterval: REFETCH_INTERVAL },
  )
}

export const makePercent = (value?: BigNumber, total?: BigNumber) =>
  value && total ? value.div(total).multipliedBy(100) : undefined

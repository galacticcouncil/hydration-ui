import { getPools } from "api/pools"
import { useApiPromise } from "utils/network"
import { getTokenBalance } from "api/balances"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { u32 } from "@polkadot/types-codec"
import { getBalanceAmount } from "utils/balance"
import { getAssetMeta } from "api/assetMeta"
import { BN_0, BN_1, DOLLAR_RATES } from "utils/constants"
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

export const useTotalLiquidity = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.calculateTotalLiqInPools, calculateTotal(api))
}

const calculateTotal = (api: ApiPromise) => async () => {
  const assets = new Set<u32>()
  const pools = await getPools(api)()

  const poolsData = pools.reduce(
    (acc: { poolId: AccountId32; assetId: u32 }[], pool) => {
      assets.add(pool.assetA)
      assets.add(pool.assetB)

      return [
        ...acc,
        { poolId: pool.id, assetId: pool.assetA },
        { poolId: pool.id, assetId: pool.assetB },
      ]
    },
    [],
  )

  const amountReqs = poolsData.map((pool) =>
    getTokenBalance(api, pool.poolId, pool.assetId)(),
  )
  let metaReqs = []
  for (const asset of assets.values()) metaReqs.push(getAssetMeta(api, asset)())
  const [balances, metas] = await Promise.all([
    Promise.all(amountReqs),
    Promise.all(metaReqs),
  ])

  const amounts = poolsData.map((pool) => {
    const meta = metas.find((m) => pool.assetId.eq(m.id))
    const balance = balances.find(
      (b) => pool.poolId.eq(b.accountId) && pool.assetId.eq(b.assetId),
    )

    const amount = getBalanceAmount(
      balance?.balance ?? BN_0,
      meta?.data.decimals.toNumber(),
    )
    const rate = DOLLAR_RATES.get(meta?.data.symbol.toHuman() as string)

    return amount.times(rate ?? BN_1)
  })
  const total = amounts.reduce((acc, amount) => acc.plus(amount), BN_0)

  return total
}

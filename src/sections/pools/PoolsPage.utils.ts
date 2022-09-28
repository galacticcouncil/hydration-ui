import { useStore } from "state/store"
import { usePools } from "api/pools"
import { useAccountDepositIds, useAllDeposits } from "api/deposits"
import { useMemo } from "react"

export type PoolsPageFilter = { showMyPositions: boolean }

export const useFilteredPools = ({ showMyPositions }: PoolsPageFilter) => {
  const { account } = useStore()
  const pools = usePools()
  const accountDeposits = useAccountDepositIds(account?.address ?? "")
  const allDeposits = useAllDeposits(pools.data?.map((pool) => pool.address))

  const queries = [pools, accountDeposits, ...allDeposits]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!account?.address) return pools.data

    if (
      !pools.data ||
      !accountDeposits.data ||
      allDeposits.some((q) => !q.data)
    )
      return undefined

    if (!showMyPositions) return pools.data

    const depositData = allDeposits
      .map((deposits) => deposits.data ?? [])
      .reduce((acc, deposits) => [...acc, ...deposits], [])

    const usersDeposits = depositData.filter((deposit) =>
      accountDeposits.data.some((ad) => ad.instanceId.eq(deposit.id)),
    )

    const relevantPools = pools.data.filter((pool) =>
      usersDeposits.some(({ deposit }) => deposit.ammPoolId.eq(pool.address)),
    )

    return relevantPools
  }, [pools, accountDeposits, allDeposits, showMyPositions, account])

  return { data, isLoading }
}

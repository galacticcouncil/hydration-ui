import { PoolBase } from "@galacticcouncil/sdk"
import { useAccountDepositIds, useDeposits } from "api/deposits"
import { useAccountStore } from "state/store"
import { useMemo } from "react"
import { useCurrentSharesValue } from "sections/pools/pool/shares/value/PoolSharesValue.utils"
import { usePoolShareToken } from "api/pools"
import { useTokenBalance } from "api/balances"

export const usePoolFooterValues = (pool: PoolBase) => {
  const { account } = useAccountStore()
  const deposits = useDeposits(pool.address)
  const depositIds = useAccountDepositIds(account?.address)
  const shareToken = usePoolShareToken(pool.address)
  const balance = useTokenBalance(shareToken.data?.token, account?.address)

  const queries = [deposits, depositIds]
  const isLoading = queries.some((q) => q.isLoading)

  // TODO: calculate current farming value
  const userDeposits = useMemo(
    () =>
      deposits.data?.filter((deposit) =>
        depositIds.data?.some((id) => id.instanceId.eq(deposit.id)),
      ),
    [deposits.data, depositIds.data],
  )

  const { dollarValue } = useCurrentSharesValue({
    shareToken: shareToken.data?.token,
    shareTokenBalance: balance.data?.balance,
    pool,
  })

  return { locked: dollarValue, isLoading }
}

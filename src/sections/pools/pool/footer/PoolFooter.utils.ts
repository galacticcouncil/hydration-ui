import { PoolBase } from "@galacticcouncil/sdk"
import { useAccountStore } from "state/store"
import { useCurrentSharesValue } from "sections/pools/pool/shares/value/PoolSharesValue.utils"
import { usePoolShareToken } from "api/pools"
import { useTokenBalance } from "api/balances"
import { useClaimableAmount, useClaimAllMutation } from "utils/farms/claiming"
import { useUserDeposits } from "utils/farms/deposits"

export const usePoolFooterValues = (pool: PoolBase) => {
  const { account } = useAccountStore()
  const shareToken = usePoolShareToken(pool.address)
  const balance = useTokenBalance(shareToken.data?.token, account?.address)

  const deposits = useUserDeposits(pool.address)
  const claimable = useClaimableAmount(pool)
  const shares = useCurrentSharesValue({
    shareToken: shareToken.data?.token,
    shareTokenBalance: balance.data?.balance,
    pool,
  })
  const claimAll = useClaimAllMutation(pool.address)

  const queries = [deposits, claimable, shares, claimAll]
  const isLoading = queries.some((q) => q.isLoading)

  return {
    locked: shares.dollarValue,
    claimable: claimable.data?.ausd,
    claimAll: claimAll.mutation,
    isLoading,
  }
}

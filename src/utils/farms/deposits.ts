import { useMemo } from "react"
import { useAccountDepositIds, useDeposits } from "api/deposits"
import { useAccountStore } from "state/store"

export const useUserDeposits = (poolId: string) => {
  const { account } = useAccountStore()
  const deposits = useDeposits(poolId)
  const depositIds = useAccountDepositIds(account?.address)

  const userDeposits = useMemo(
    () =>
      deposits.data?.filter((deposit) =>
        depositIds.data?.some((id) => id.instanceId.eq(deposit.id)),
      ),
    [deposits.data, depositIds.data],
  )

  return {
    data: userDeposits,
    isLoading: deposits.isLoading || depositIds.isLoading,
  }
}

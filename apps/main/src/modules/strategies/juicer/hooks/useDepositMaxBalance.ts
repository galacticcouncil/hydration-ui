import { useDepositReferenceTx } from "@/modules/strategies/juicer/hooks/useVaultWrites"
import { type JuicerDepositOption } from "@/modules/strategies/juicer/utils/depositOptions"
import {
  useFeeReservedBalance,
  useFeeReserveNeed,
} from "@/modules/transactions/hooks/useFeeReservedBalance"

/** What a deposit may spend: the balance, less the fee when it pays fees. */
export const useDepositMaxBalance = (
  deposit: JuicerDepositOption,
  balance: string,
) => {
  const need = useFeeReserveNeed(deposit.assetId, balance)
  const { data, isError } = useDepositReferenceTx(
    deposit,
    balance,
    need.needsReserve,
  )
  return useFeeReservedBalance(need, balance, { tx: data, isError })
}

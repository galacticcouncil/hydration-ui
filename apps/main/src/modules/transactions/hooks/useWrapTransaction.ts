import { isBigInt } from "remeda"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

export const useWrapTransaction = (
  transaction: SingleTransaction,
): SingleTransaction => {
  const { papi } = useRpcProvider()
  return transaction?.withExtraGas && isPapiTransaction(transaction.tx)
    ? {
        ...transaction,
        tx: papi.tx.Dispatcher.dispatch_with_extra_gas({
          call: transaction.tx.decodedCall,
          extra_gas: isBigInt(transaction.withExtraGas)
            ? transaction.withExtraGas
            : AAVE_GAS_LIMIT,
        }),
      }
    : transaction
}

import { isBigInt } from "remeda"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { useRpcProvider } from "@/providers/rpcProvider"
import { SingleTransaction } from "@/states/transactions"

export const useWrapTransaction = (
  transaction: SingleTransaction,
): SingleTransaction => {
  const { papi } = useRpcProvider()
  return transaction
}

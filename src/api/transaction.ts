import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useAccountStore } from "../state/store"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "../utils/queryKeys"
import { undefinedNoop } from "utils/helpers"

const getPaymentInfo =
  (tx: SubmittableExtrinsic, account: AccountId32 | string) => async () => {
    const paymentInfo = await tx.paymentInfo(account)
    return paymentInfo
  }

export function usePaymentInfo(tx: SubmittableExtrinsic) {
  const { account } = useAccountStore()
  const finalAccount = account?.address

  return useQuery(
    QUERY_KEYS.paymentInfo(tx.hash, finalAccount),
    finalAccount != null ? getPaymentInfo(tx, finalAccount) : undefinedNoop,
    { enabled: !!finalAccount },
  )
}

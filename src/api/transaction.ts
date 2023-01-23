import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useAccountStore } from "../state/store"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "../utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useApiPromise } from "utils/api"

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

export function useNextNonce(account: Maybe<AccountId32 | string>) {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.nextNonce(account),
    account != null
      ? async () => {
          if (!account) throw new Error("Missing address")
          return await api.rpc.system.accountNextIndex(account)
        }
      : undefinedNoop,
    { enabled: !!account },
  )
}

export function getTransactionLink(hash: string) {
  return `https://hydradx.subscan.io/extrinsic/${hash}`
}

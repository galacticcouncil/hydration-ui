import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useAccountStore } from "state/store"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useMutation, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useApiPromise } from "utils/api"
import { ApiPromise } from "@polkadot/api"

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

export function getSubscanLink(blockNumber: string, txIndex: string) {
  return `https://hydradx.subscan.io/extrinsic/${[blockNumber, txIndex].join(
    "-",
  )}`
}

export function useTransactionLink() {
  const api = useApiPromise()
  return useMutation(
    async ({
      blockHash,
      txIndex,
    }: {
      blockHash?: string
      txIndex?: string
    }) => {
      if (!(blockHash && txIndex)) {
        return undefined
      }
      return getTransactionLinkFromHash(api, blockHash, txIndex)
    },
  )
}

export async function getTransactionLinkFromHash(
  api: ApiPromise,
  blockHash: string,
  txIndex: string,
) {
  try {
    const { block } = await api.rpc.chain.getBlock(blockHash)
    const blockNumber = block.header.number.toString()

    if (blockNumber) {
      return getSubscanLink(blockNumber, txIndex)
    }

    return undefined
  } catch (err) {
    return undefined
  }
}

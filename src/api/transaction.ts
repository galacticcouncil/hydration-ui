import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useMutation, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { useRpcProvider } from "providers/rpcProvider"
import { isEvmAccount } from "utils/evm"
import { BN_0 } from "utils/constants"
import { EthereumSigner } from "sections/web3-connect/signer/EthereumSigner"
import { create } from "zustand"
import BigNumber from "bignumber.js"

const getPaymentInfo =
  (tx: SubmittableExtrinsic, account: AccountId32 | string) => async () => {
    const paymentInfo = await tx.paymentInfo(account)
    return paymentInfo
  }

export function usePaymentInfo(tx: SubmittableExtrinsic, disabled?: boolean) {
  const { account } = useAccount()
  const finalAccount = account?.address

  return useQuery(
    QUERY_KEYS.paymentInfo(tx.hash, finalAccount),
    finalAccount != null ? getPaymentInfo(tx, finalAccount) : undefinedNoop,
    { enabled: !!finalAccount && !disabled },
  )
}

export function useNextEvmPermitNonce(account: Maybe<AccountId32 | string>) {
  const { wallet } = useWallet()
  const { permitNonce, setPermitNonce, incrementPermitNonce } =
    useEvmPermitStore()
  useQuery(
    QUERY_KEYS.nextEvmPermitNonce(account),
    async () => {
      if (!account) throw new Error("Missing address")
      if (!wallet?.signer) throw new Error("Missing wallet signer")
      if (wallet.signer instanceof EthereumSigner) {
        return await wallet.signer.getPermitNonce()
      }
    },
    {
      enabled: isEvmAccount(account?.toString()),
      cacheTime: 1000 * 60 * 60 * 24,
      staleTime: 1000 * 60 * 60 * 24,
      onSuccess: (nonce) => {
        if (nonce) {
          setPermitNonce(nonce)
        }
      },
    },
  )

  return {
    permitNonce,
    incrementPermitNonce,
  }
}

export function useNextNonce(account: Maybe<AccountId32 | string>) {
  const { api } = useRpcProvider()

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
  return `https://hydration.subscan.io/extrinsic/${[blockNumber, txIndex].join(
    "-",
  )}`
}

export function useTransactionLink() {
  const { api } = useRpcProvider()
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

export const useEvmPermitStore = create<{
  permitNonce: BigNumber
  incrementPermitNonce: () => void
  setPermitNonce: (nonce: BigNumber) => void
}>((set) => ({
  permitNonce: BN_0,
  setPermitNonce: (nonce: BigNumber) => set({ permitNonce: nonce }),
  incrementPermitNonce: () =>
    set((state) => ({ permitNonce: state.permitNonce.plus(1) })),
}))

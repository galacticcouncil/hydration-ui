import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { ApiPromise } from "@polkadot/api"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_0 } from "utils/constants"
import BigNumber from "bignumber.js"
import { useSpotPrice } from "api/spotPrice"
import { useAccountCurrency } from "api/payments"
import { useMemo } from "react"
import { createSubscanLink } from "utils/formatting"
import { useAssets } from "providers/assets"

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

export function useMultiplePaymentInfo(
  txs: SubmittableExtrinsic[],
  disabled?: boolean,
) {
  const { account } = useAccount()
  const finalAccount = account?.address

  const queries = txs.map((tx) => ({
    queryKey: QUERY_KEYS.paymentInfo(tx.hash, finalAccount),
    queryFn:
      finalAccount != null ? getPaymentInfo(tx, finalAccount) : undefinedNoop,
    enabled: !!finalAccount && !disabled,
  }))

  return useQueries({ queries })
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
      return createSubscanLink("extrinsic", `${blockNumber}-${txIndex}`)
    }

    return undefined
  } catch (err) {
    return undefined
  }
}

export const useEstimatedFees = (txs: SubmittableExtrinsic[]) => {
  const { getAsset, native } = useAssets()
  const { account } = useAccount()

  const accountCurrency = useAccountCurrency(account?.address)
  const accountCurrencyMeta = accountCurrency.data
    ? getAsset(accountCurrency.data)
    : undefined

  const nativeId = native.id
  const nativeDecimals = native.decimals
  const accountCurrencyId = accountCurrencyMeta?.id
  const accountCurrencyDecimals = accountCurrencyMeta?.decimals ?? 0

  const decimalsDiff =
    nativeDecimals - (accountCurrencyDecimals || nativeDecimals)

  const { data: spotPrice } = useSpotPrice(nativeId, accountCurrencyId)

  const fees = useMultiplePaymentInfo(txs)

  return useMemo(() => {
    const defaultFees = {
      nativeFee: BN_0,
      nativeFeeDisplay: BN_0,
      accountCurrencyFee: BN_0,
      accountCurrencyFeeDisplay: BN_0,
      accountCurrencyId,
    }

    if (fees.some(({ data }) => !data) || !spotPrice) {
      return defaultFees
    }

    return fees.reduce((prev, curr) => {
      const price = spotPrice.spotPrice

      const nativeFee = curr?.data?.partialFee?.toBigNumber() ?? BN_0
      const nativeFeeTotal = nativeFee.plus(prev.nativeFee)

      const accountCurrencyFee = nativeFee
        .multipliedBy(price)
        .shiftedBy(-decimalsDiff)
        .decimalPlaces(0, BigNumber.ROUND_CEIL)

      const accountCurrencyFeeTotal = accountCurrencyFee.plus(
        prev.accountCurrencyFee,
      )

      return {
        ...prev,
        nativeFee: nativeFeeTotal,
        nativeFeeDisplay: nativeFeeTotal.shiftedBy(-nativeDecimals),
        accountCurrencyFee: accountCurrencyFeeTotal,
        accountCurrencyFeeDisplay: accountCurrencyFeeTotal.shiftedBy(
          -accountCurrencyDecimals,
        ),
      }
    }, defaultFees)
  }, [
    accountCurrencyDecimals,
    accountCurrencyId,
    decimalsDiff,
    fees,
    nativeDecimals,
    spotPrice,
  ])
}

export const useBlockWeight = () => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery(
    QUERY_KEYS.blockWeight,
    async () => {
      const dataRaw = await api.consts.system.blockWeights
      const data = dataRaw.perClass.normal.maxExtrinsic.unwrapOr(null)

      if (!data) return undefined

      return {
        refTime: data.refTime.toString(),
        proofSize: data.proofSize.toString(),
      }
    },
    { enabled: isLoaded, cacheTime: Infinity, staleTime: Infinity },
  )
}

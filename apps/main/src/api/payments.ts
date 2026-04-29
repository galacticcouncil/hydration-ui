import { MultiSignature } from "@galacticcouncil/descriptors"
import { DOT_ASSET_ID } from "@galacticcouncil/utils"
import {
  isPolkadotSigner,
  useAccount,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { AccountId, compactNumber } from "@polkadot-api/substrate-bindings"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Binary } from "polkadot-api"
import { mergeUint8 } from "polkadot-api/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isBigInt, isNumber, pick, prop, unique, zip } from "remeda"
import { useShallow } from "zustand/shallow"

import { useAccountInfo } from "@/api/account"
import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiValue } from "@/hooks/usePapiValue"
import { AnyPapiTx } from "@/modules/transactions/types"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"
import { TransactionOptions, useTransactionsStore } from "@/states/transactions"
import { NATIVE_ASSET_ID } from "@/utils/consts"

import { allPools } from "./pools"

const isCurrencyAccepted = (asset: TAsset, data?: bigint) => {
  // Native asset is always accepted
  if (asset.id === NATIVE_ASSET_ID) return true
  // Allow all other assets with data
  if (isBigInt(data) && data > 0n) return true
  return false
}

export const useAcceptedFeePaymentAssets = (ids: string[]) => {
  const { papi, isLoaded, sdk } = useRpcProvider()
  const queryClient = useQueryClient()
  const { getAsset } = useAssets()

  return useQuery({
    enabled: isLoaded && ids.length > 0,
    queryKey: ["acceptedCurrencies", ids],
    queryFn: async () => {
      const assetIds = ids.map<[number]>((id) => [Number(id)])

      const [pools, acceptedCurrencies] = await Promise.all([
        queryClient.ensureQueryData(allPools(sdk)),
        papi.query.MultiTransactionPayment.AcceptedCurrencies.getValues(
          assetIds,
        ),
      ])

      const entries = zip(ids, acceptedCurrencies)

      return entries.reduce((acc, [id, data]) => {
        const asset = getAsset(id)

        if (!asset) return acc

        const isAccepted = isCurrencyAccepted(asset, data)

        if (isAccepted) {
          acc.push(asset)
          return acc
        }

        const hasPoolWithDOT = pools.allPools.some(
          (pool) =>
            pool.tokens.find((token) => token.id === Number(asset.id)) &&
            pool.tokens.find((token) => token.id === Number(DOT_ASSET_ID)),
        )

        if (hasPoolWithDOT) {
          acc.push(asset)
          return acc
        }

        return acc
      }, [] as TAsset[])
    },
  })
}

export const useAccountFeePaymentAssetId = (
  options?: UseBaseObservableQueryOptions,
) => {
  const { isConnected, account } = useAccount()
  const address = isConnected ? account.address : ""

  return usePapiValue(
    "MultiTransactionPayment.AccountCurrencyMap",
    [address, { at: "best" }],
    {
      select: (assetId) => assetId || Number(NATIVE_ASSET_ID),
      ...options,
    },
  )
}

export const useAccountFeePaymentAssets = () => {
  const { getAsset } = useAssets()

  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )
  const { data: accountFeePaymentAssetId, isLoading: isPaymentAssetLoading } =
    useAccountFeePaymentAssetId()

  const allowedFeePaymentAssetIds = useMemo<string[]>(() => {
    if (
      isBalanceLoading ||
      isPaymentAssetLoading ||
      !isNumber(accountFeePaymentAssetId)
    )
      return []

    const assetIds = Object.keys(balances)
    return unique([...assetIds, accountFeePaymentAssetId.toString()])
  }, [
    accountFeePaymentAssetId,
    balances,
    isPaymentAssetLoading,
    isBalanceLoading,
  ])

  const {
    data: acceptedFeePaymentAssets,
    isLoading: isAcceptedFeePaymentAssetsLoading,
  } = useAcceptedFeePaymentAssets(allowedFeePaymentAssetIds)

  const isLoading =
    isBalanceLoading ||
    isPaymentAssetLoading ||
    isAcceptedFeePaymentAssetsLoading

  const acceptedFeePaymentAssetsIds = useMemo(() => {
    if (!acceptedFeePaymentAssets) return []
    return acceptedFeePaymentAssets.map(prop("id"))
  }, [acceptedFeePaymentAssets])

  const accountFeePaymentAsset = isNumber(accountFeePaymentAssetId)
    ? getAsset(accountFeePaymentAssetId.toString())
    : undefined

  return {
    isLoading,
    accountFeePaymentAsset,
    accountFeePaymentAssetId,
    acceptedFeePaymentAssets,
    acceptedFeePaymentAssetsIds,
  }
}

export const EVM_CLAIM_ACCOUNT_MESSAGE_PREFIX = "EVMAccounts::claim_account"

export function getEvmAccountClaimMessage(
  address: string,
  assetId: string,
): Uint8Array {
  const prefixU8a = new TextEncoder().encode(EVM_CLAIM_ACCOUNT_MESSAGE_PREFIX)
  const compactPrefix = mergeUint8([
    compactNumber.enc(prefixU8a.length),
    prefixU8a,
  ])

  const publicKey = AccountId().enc(address)

  const assetIdBuffer = new ArrayBuffer(4)
  new DataView(assetIdBuffer).setUint32(0, Number(assetId), true)
  const assetIdU8a = new Uint8Array(assetIdBuffer)

  return mergeUint8([compactPrefix, publicKey, assetIdU8a])
}

export const useSetFeePaymentAsset = (options: TransactionOptions) => {
  const { t } = useTranslation(["common"])
  const { papi } = useRpcProvider()
  const { account } = useAccount()
  const wallet = useWallet()

  const { createTransaction } = useTransactionsStore()
  const { getAsset, isErc20 } = useAssets()
  const { data: accountInfo } = useAccountInfo()

  return useMutation({
    mutationFn: async (assetId: string) => {
      const asset = getAsset(assetId)

      if (!account) throw new Error("No account connected")
      if (!asset) throw new Error(`Asset (${assetId}) not found`)
      if (!accountInfo) throw new Error("Account info not found")

      const { nonce, providers, sufficients } = accountInfo
      const isUnclaimedAccount =
        nonce === 0 && providers === 0 && sufficients === 0

      const getTx = async (): Promise<AnyPapiTx> => {
        if (isUnclaimedAccount && isPolkadotSigner(wallet?.signer)) {
          const message = getEvmAccountClaimMessage(account.address, assetId)
          const signature = await wallet.signer.signBytes(message)

          return papi.tx.EVMAccounts.claim_account({
            account: account.address,
            asset_id: Number(assetId),
            signature: MultiSignature.Sr25519(Binary.toHex(signature)),
          })
        }

        return papi.tx.MultiTransactionPayment.set_currency({
          currency: Number(asset.id),
        })
      }

      return createTransaction(
        {
          ...(isUnclaimedAccount
            ? { isUnsigned: true }
            : { withExtraGas: isErc20(asset) }),
          tx: await getTx(),
          fee: {
            feePaymentAssetId: assetId,
          },
          toasts: {
            submitted: t("payment.toast.onLoading", {
              symbol: asset.symbol,
            }),
            success: t("payment.toast.onSuccess", {
              symbol: asset.symbol,
            }),
          },
        },
        options,
      )
    },
  })
}

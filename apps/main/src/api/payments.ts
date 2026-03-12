import { MultiSignature } from "@galacticcouncil/descriptors"
import { DOT_ASSET_ID } from "@galacticcouncil/utils"
import {
  isPolkadotSigner,
  useAccount,
  useWallet,
} from "@galacticcouncil/web3-connect"
import {
  Binary,
  compactNumber,
  FixedSizeBinary,
  getSs58AddressInfo,
  SS58String,
} from "@polkadot-api/substrate-bindings"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isBigInt, isNumber, pick, prop, unique, zip } from "remeda"
import { mergeUint8 } from "polkadot-api/utils"
import { useShallow } from "zustand/shallow"

import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiValue } from "@/hooks/usePapiValue"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"
import { TransactionOptions, useTransactionsStore } from "@/states/transactions"
import { NATIVE_ASSET_ID } from "@/utils/consts"

import { allPools } from "./pools"

const EVM_CLAIM_ACCOUNT_MESSAGE_PREFIX = "EVMAccounts::claim_account"

function getEvmAccountClaimMessage(address: string, assetId: string): Uint8Array {
  const prefixBytes = new TextEncoder().encode(EVM_CLAIM_ACCOUNT_MESSAGE_PREFIX)
  const addressInfo = getSs58AddressInfo(address as SS58String)
  if (!addressInfo.isValid) throw new Error("Invalid SS58 address")
  const assetIdBytes = new Uint8Array(4)
  new DataView(assetIdBytes.buffer).setUint32(0, Number(assetId), true)
  return mergeUint8(
    compactNumber.enc(prefixBytes.length),
    prefixBytes,
    addressInfo.publicKey,
    assetIdBytes,
  )
}

const isCurrencyAccepted = (asset: TAsset, data?: bigint) => {
  // Native asset is always accepted
  if (asset.id === NATIVE_ASSET_ID) return true
  // Disallow all Erc20 assets
  if (asset.type === "Erc20") return false
  // Allow all other assets with data
  if (isBigInt(data) && data > 0) return true
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
    [address, "best"],
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

export const useSetFeePaymentAsset = (options: TransactionOptions) => {
  const { t } = useTranslation(["common"])
  const { papi, papiClient } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const { getAsset, isErc20 } = useAssets()
  const { account } = useAccount()
  const wallet = useWallet()

  return useMutation({
    mutationFn: async (assetId: string) => {
      const asset = getAsset(assetId)

      if (!asset) throw new Error(`Asset (${assetId}) not found`)

      if (account?.address) {
        const accountInfo = await papi.query.System.Account.getValue(
          account.address,
        )
        const isUnclaimedAccount =
          accountInfo.nonce === 0 &&
          accountInfo.providers === 0 &&
          accountInfo.sufficients === 0

        const signer = wallet?.signer

        if (isUnclaimedAccount && isPolkadotSigner(signer)) {
          const message = getEvmAccountClaimMessage(account.address, assetId)
          const sigBytes = await signer.signBytes(message)

          const claimTx = papi.tx.EVMAccounts.claim_account({
            account: account.address as SS58String,
            asset_id: Number(assetId),
            signature: MultiSignature.Sr25519(new FixedSizeBinary(sigBytes)),
          })

          const callData = await claimTx.getEncodedData()
          const rawCallData = callData.asBytes()
          const unsignedTxHex = Binary.fromBytes(
            mergeUint8(
              compactNumber.enc(rawCallData.length + 1),
              new Uint8Array([4]),
              rawCallData,
            ),
          ).asHex()

          await new Promise<void>((resolve, reject) => {
            const sub = papiClient.submitAndWatch(unsignedTxHex).subscribe({
              next: (event) => {
                if (event.type === "txBestBlocksState" && event.found) {
                  if (!event.ok) {
                    reject(new Error("EVM account claim failed"))
                  } else {
                    resolve()
                  }
                  sub.unsubscribe()
                }
              },
              error: reject,
            })
          })
        }
      }

      return createTransaction(
        {
          withExtraGas: isErc20(asset),
          tx: papi.tx.MultiTransactionPayment.set_currency({
            currency: Number(asset.id),
          }),
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
            error: t("payment.toast.onLoading", {
              symbol: asset.symbol,
            }),
          },
        },
        options,
      )
    },
  })
}

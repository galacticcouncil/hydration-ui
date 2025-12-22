import { ApiPromise } from "@polkadot/api"
import {
  BN,
  bnToU8a,
  compactAddLength,
  stringToU8a,
  u8aConcat,
} from "@polkadot/util"
import { decodeAddress, signatureVerify } from "@polkadot/util-crypto"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isPolkadotSigner } from "sections/web3-connect/signer/PolkadotSigner"
import { useAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { NATIVE_ASSET_ID } from "utils/api"
import { AAVE_EXTRA_GAS } from "utils/constants"
import { NATIVE_EVM_ASSET_ID, isEvmAccount } from "utils/evm"
import { Maybe, identity, isNotNil, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { uniqBy } from "utils/rx"
import { useAccountBalances } from "./deposits"

export const getAcceptedCurrency = (api: ApiPromise) => async () => {
  const dataRaw =
    await api.query.multiTransactionPayment.acceptedCurrencies.entries()

  const data = dataRaw.map(([key, data]) => {
    return {
      id: key.args[0].toString(),
      accepted: !data.isEmpty,
      data: data.unwrapOr(null)?.toBigNumber(),
    }
  })

  return data
}

export const useAcceptedCurrencies = (ids: string[]) => {
  const { api, isLoaded, sdk, timestamp } = useRpcProvider()
  const { native, getAsset } = useAssets()

  const { api: sdkApi } = sdk

  return useQuery(
    [...QUERY_KEYS.acceptedCurrencies(ids), timestamp],
    async () => {
      const [pools, acceptedCurrency] = await Promise.all([
        sdkApi.router.getPools(),
        getAcceptedCurrency(api)(),
      ])

      return ids.map((id) => {
        const currency = acceptedCurrency.find((currency) => currency.id === id)

        if (currency && getAsset(currency.id)?.isErc20) {
          return {
            ...currency,
            accepted: true,
          }
        }

        if (currency) {
          return currency
        }

        if (id === native.id) {
          return { id, accepted: true, data: undefined }
        }

        const hasPoolWithDOT = !!pools.find((pool) => {
          return (
            pool.tokens.find((token) => token.id === id) &&
            pool.tokens.find((token) => token.id === "5")
          )
        })

        if (hasPoolWithDOT) {
          return { id, accepted: true, data: undefined }
        }

        return { id, accepted: false, data: undefined }
      })
    },
    {
      enabled: isLoaded && ids.length > 0,
      staleTime: Infinity,
    },
  )
}

function getMessage(address: string, assetId: string) {
  const MESSAGE_PREFIX = "EVMAccounts::claim_account"

  const prefixU8a = compactAddLength(stringToU8a(MESSAGE_PREFIX))
  const assetIdU8a = bnToU8a(new BN(assetId), {
    isLe: true,
    bitLength: 32,
  })

  const publicKey = decodeAddress(address)

  const message = u8aConcat(prefixU8a, publicKey, assetIdU8a)

  console.log("prefix encoded:", Buffer.from(prefixU8a).toString("hex"))
  console.log("account encoded:", Buffer.from(publicKey).toString("hex"))
  console.log(
    `assetId (${assetId}) encoded:`,
    Buffer.from(assetIdU8a).toString("hex"),
  )
  console.log("message:", Buffer.from(message).toString("hex"))

  return message
}

export const useSetAsFeePayment = () => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { native, getAssetWithFallback } = useAssets()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { wallet } = useWallet()

  return useMutation(
    async (tokenId?: string) => {
      if (!tokenId) return
      if (!account?.address) return
      if (!wallet) return

      const meta = getAssetWithFallback(tokenId)

      const toast = createToastMessages(
        "wallet.assets.table.actions.payment.toast",
        {
          t,
          tOptions: {
            asset: meta.symbol,
          },
          components: ["span", "span.highlight"],
        },
      )

      const paymentInfoData = await api.tx.currencies
        .transfer("", native.id, "0")
        .paymentInfo(account.address)

      const accountInfo = await api.query.system.account(account.address)

      console.log({
        nonce: accountInfo.nonce.toString(),
        providers: accountInfo.providers.toString(),
        sufficients: accountInfo.sufficients.toString(),
      })

      const isUnclaimedAccount =
        BigNumber(accountInfo.nonce.toString()).eq(0) &&
        BigNumber(accountInfo.providers.toString()).eq(0) &&
        BigNumber(accountInfo.sufficients.toString()).eq(0)

      const signer = wallet.extension.signer

      if (isUnclaimedAccount && isPolkadotSigner(signer)) {
        const message = getMessage(account.address, tokenId)

        const { signature } = await signer.signRaw({
          address: account.address,
          data: `0x${Buffer.from(message).toString("hex")}`,
          type: "bytes",
        })

        console.log(
          "signature:",
          signature,
          signatureVerify(message, signature, decodeAddress(account.address)),
        )
        const unsignedTx = api.tx.evmAccounts.claimAccount(
          account.address,
          tokenId,
          {
            Sr25519: signature,
          },
        )
        await unsignedTx.send()
        console.log("SENT")
      }

      return await createTransaction(
        {
          tx: meta.isErc20
            ? api.tx.dispatcher.dispatchWithExtraGas(
                api.tx.multiTransactionPayment.setCurrency(tokenId),
                AAVE_EXTRA_GAS,
              )
            : api.tx.multiTransactionPayment.setCurrency(tokenId),
          overrides: {
            fee: new BigNumber(paymentInfoData.partialFee.toHex()),
            currencyId: tokenId,
          },
        },
        { toast },
      )
    },
    {
      onSuccess: () =>
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.accountCurrency(account?.address),
        }),
    },
  )
}

export const getAccountCurrency =
  (api: ApiPromise, address: string) => async () => {
    const result =
      await api.query.multiTransactionPayment.accountCurrencyMap(address)

    if (!result.isEmpty) {
      return result.toString()
    }

    if (!isEvmAccount(address)) {
      return NATIVE_ASSET_ID
    }
  }

export const useAccountCurrency = (address: Maybe<string>) => {
  const { api, isLoaded } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountCurrency(address),
    !!address ? getAccountCurrency(api, address) : undefinedNoop,
    {
      enabled: !!address && isLoaded,
    },
  )
}

export const useAccountFeePaymentAssets = () => {
  const { featureFlags } = useRpcProvider()
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const accountAssets = useAccountBalances()
  const accountFeePaymentAsset = useAccountCurrency(account?.address)
  const feePaymentAssetId = accountFeePaymentAsset.data

  const allowedFeePaymentAssetsIds = useMemo(() => {
    if (isEvmAccount(account?.address) && !featureFlags.dispatchPermit) {
      const evmNativeAssetId = getAsset(NATIVE_EVM_ASSET_ID)?.id
      return uniqBy(
        identity,
        [evmNativeAssetId, feePaymentAssetId].filter(isNotNil),
      )
    }

    const assetIds =
      accountAssets.data?.balances?.map((balance) => balance.asset.id) ?? []
    return uniqBy(identity, [...assetIds, feePaymentAssetId].filter(isNotNil))
  }, [
    account?.address,
    featureFlags.dispatchPermit,
    accountAssets,
    feePaymentAssetId,
    getAsset,
  ])

  const acceptedFeePaymentAssets = useAcceptedCurrencies(
    allowedFeePaymentAssetsIds,
  )

  const data = acceptedFeePaymentAssets?.data ?? []

  const acceptedFeePaymentAssetsIds = data
    .filter((acceptedFeeAsset) => acceptedFeeAsset?.accepted)
    .map((acceptedFeeAsset) => acceptedFeeAsset?.id)

  const isLoading =
    accountFeePaymentAsset.isLoading ||
    acceptedFeePaymentAssets.isLoading ||
    accountAssets.isLoading
  const isInitialLoading =
    accountFeePaymentAsset.isInitialLoading ||
    acceptedFeePaymentAssets.isInitialLoading ||
    accountAssets.isInitialLoading
  const isSuccess =
    accountFeePaymentAsset.isSuccess &&
    acceptedFeePaymentAssets.isSuccess &&
    accountAssets.isSuccess

  return {
    acceptedFeePaymentAssetsIds,
    acceptedFeePaymentAssets,
    feePaymentAssetId,
    isLoading,
    isInitialLoading,
    isSuccess,
  }
}

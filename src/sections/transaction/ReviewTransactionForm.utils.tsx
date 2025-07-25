import { SubmittableExtrinsic } from "@polkadot/api/types"
import { useBestNumber } from "api/chain"
import { useEra } from "api/era"
import { useAccountFeePaymentAssets, useSetAsFeePayment } from "api/payments"
import { useSpotPrice } from "api/spotPrice"
import { useNextNonce, usePaymentInfo } from "api/transaction"
import BigNumber from "bignumber.js"
import { useTranslation } from "react-i18next"
import { useAssetsModal } from "sections/assets/AssetsModal.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { BN_1 } from "utils/constants"
import { useRpcProvider } from "providers/rpcProvider"
import {
  NATIVE_EVM_ASSET_DECIMALS,
  NATIVE_EVM_ASSET_ID,
  isEvmAccount,
} from "utils/evm"
import { BN_NAN } from "utils/constants"
import { useUserReferrer } from "api/referrals"
import { HYDRATION_CHAIN_KEY } from "sections/xcm/XcmPage.utils"
import { useReferralCodesStore } from "sections/referrals/store/useReferralCodesStore"
import { useEvmPaymentFee } from "api/evm"
import { useProviderRpcUrlStore } from "api/provider"
import { useMemo } from "react"
import { useAssets } from "providers/assets"
import {
  useNextEvmPermitNonce,
  usePendingDispatchPermit,
} from "sections/transaction/ReviewTransaction.utils"
import { useAccountBalances } from "api/deposits"
import { useHealthFactorChange } from "api/borrow"
import BN from "bignumber.js"
import { ProtocolAction } from "@aave/contract-helpers"
import { TradeMetadata, TxType, XcmMetadata } from "@galacticcouncil/apps"
import { ApiPromise } from "@polkadot/api"

export const isTxType = (
  tx: SubmittableExtrinsic<"promise"> | TxType,
): tx is TxType => {
  return tx && "hex" in tx && "get" in tx
}

export const toSubmittableExtrinsic = (
  api: ApiPromise,
  tx: SubmittableExtrinsic<"promise"> | TxType,
): SubmittableExtrinsic<"promise"> => {
  if (isTxType(tx)) {
    return api.tx(tx.hex)
  }
  return tx
}

export const useTransactionValues = ({
  xcallMeta,
  overrides,
  tx,
}: {
  xcallMeta?: XcmMetadata
  overrides?: {
    currencyId?: string
    feeExtra?: BigNumber
    fee: BigNumber
  }
  tx: SubmittableExtrinsic<"promise">
}) => {
  const { api } = useRpcProvider()
  const { native, getAsset } = useAssets()
  const { account } = useAccount()
  const bestNumber = useBestNumber()

  const { fee, currencyId: feePaymentId, feeExtra } = overrides ?? {}

  const isEvm = isEvmAccount(account?.address)
  const shouldFetchEvmFee = isEvm && feePaymentId === NATIVE_EVM_ASSET_ID
  const evmPaymentFee = useEvmPaymentFee(
    tx.method.toHex(),
    shouldFetchEvmFee ? account?.address : "",
  )

  /* REFERRALS */

  const referrer = useUserReferrer(account?.address)

  const isLinkedAccount = !xcallMeta ? !!referrer.data?.length : true

  const storedReferralCodes = useReferralCodesStore()
  const storedReferralCode = account?.address
    ? storedReferralCodes.referralCodes[account.address]
    : undefined

  const boundedTx =
    !isLinkedAccount &&
    storedReferralCode &&
    tx.method.method !== "linkCode" &&
    !xcallMeta
      ? api.tx.utility.batchAll([
          api.tx.referrals.linkCode(storedReferralCode),
          tx,
        ])
      : tx

  const isNewReferralLink = tx.method.method === "registerCode"

  const { data: paymentInfo, isLoading: isPaymentInfoLoading } =
    usePaymentInfo(boundedTx)

  const {
    acceptedFeePaymentAssetsIds,
    acceptedFeePaymentAssets,
    feePaymentAssetId,
    ...feePaymentAssets
  } = useAccountFeePaymentAssets()

  // fee payment asset which should be displayed on the screen
  const accountFeePaymentId = feePaymentId ?? feePaymentAssetId

  const feePaymentMeta = accountFeePaymentId
    ? getAsset(accountFeePaymentId)
    : undefined

  const { data: spotPrice, isInitialLoading: isPriceLoading } = useSpotPrice(
    native.id,
    accountFeePaymentId,
  )
  const accountAssets = useAccountBalances()
  const feeAssetBalance = accountFeePaymentId
    ? accountAssets.data?.accountAssetsMap.get(accountFeePaymentId)?.balance
    : undefined

  const isSpotPriceNan = BigNumber(spotPrice?.spotPrice ?? NaN).isNaN()

  const srcChain = xcallMeta?.srcChain || HYDRATION_CHAIN_KEY

  const shouldUsePermit =
    isEvm &&
    srcChain === HYDRATION_CHAIN_KEY &&
    feePaymentMeta?.id !== NATIVE_EVM_ASSET_ID
  const { data: pendingPermit } = usePendingDispatchPermit(account?.address)

  const nonce = useNextNonce(account?.address)
  const permitNonce = useNextEvmPermitNonce(account?.address)

  const isNonceLoading = shouldUsePermit
    ? permitNonce.isLoading
    : nonce.isLoading

  const era = useEra(
    boundedTx.era,
    bestNumber.data?.parachainBlockNumber.toString(),
  )

  const txWeight = paymentInfo?.weight.refTime.toString()
  const feePaymentValue = paymentInfo?.partialFee.toBigNumber() ?? BN_NAN
  const paymentFeeHDX = paymentInfo
    ? BigNumber(fee ?? paymentInfo.partialFee.toHex()).shiftedBy(
        -native.decimals,
      )
    : null

  const isLoading =
    feePaymentAssets.isInitialLoading ||
    evmPaymentFee.isInitialLoading ||
    isPaymentInfoLoading ||
    isPriceLoading ||
    isNonceLoading ||
    acceptedFeePaymentAssets.isInitialLoading ||
    referrer.isInitialLoading

  if (!feePaymentMeta || !paymentFeeHDX || !accountFeePaymentId)
    return {
      isLoading,
      data: {
        isEnoughPaymentBalance: false,
        displayFeePaymentValue: BN_NAN,
        feePaymentMeta,
        acceptedFeePaymentAssets: [],
        era,
        nonce: nonce.data,
        isLinkedAccount,
        storedReferralCode,
        tx: boundedTx,
        isNewReferralLink,
        shouldUsePermit,
        permitNonce: permitNonce.data,
        pendingPermit,
        txWeight,
      },
    }

  let displayFeePaymentValue: BigNumber | undefined
  let displayFeeExtra: BigNumber | undefined

  if (!isSpotPriceNan) {
    displayFeePaymentValue = paymentFeeHDX.multipliedBy(
      spotPrice?.spotPrice ?? 1,
    )
    displayFeeExtra = feeExtra
      ? feeExtra
          .shiftedBy(-native.decimals)
          .multipliedBy(spotPrice?.spotPrice ?? 1)
      : undefined
  } else {
    const accountFeePaymentCurrency = acceptedFeePaymentAssets.data?.find(
      (acceptedFeePaymentAsset) =>
        acceptedFeePaymentAsset.id === accountFeePaymentId,
    )

    const transactionPaymentValue = accountFeePaymentCurrency?.data?.shiftedBy(
      -feePaymentMeta.decimals,
    )

    if (transactionPaymentValue) {
      displayFeePaymentValue = BN_1.div(transactionPaymentValue).multipliedBy(
        paymentFeeHDX,
      )
      displayFeeExtra = feeExtra
        ? BN_1.div(transactionPaymentValue).multipliedBy(
            feeExtra.shiftedBy(-native.decimals),
          )
        : undefined
    }
  }

  let isEnoughPaymentBalance: boolean
  if (srcChain === "bifrost") {
    // @TODO remove when fixed in xcm app
    isEnoughPaymentBalance = true
  } else if (xcallMeta && srcChain !== HYDRATION_CHAIN_KEY) {
    const feeBalanceDiff =
      parseFloat(xcallMeta.srcChainFeeBalance) -
      parseFloat(xcallMeta.srcChainFee)
    isEnoughPaymentBalance = feeBalanceDiff > 0
  } else {
    isEnoughPaymentBalance = feeAssetBalance?.transferable
      ? BigNumber(feeAssetBalance.transferable)
          .shiftedBy(-feePaymentMeta.decimals)
          .minus(displayFeePaymentValue ?? 0)
          .minus(displayFeeExtra ?? 0)
          .gt(0)
      : false
  }

  let displayEvmFeePaymentValue
  if (isEvm && evmPaymentFee?.data) {
    displayEvmFeePaymentValue = evmPaymentFee.data.shiftedBy(
      -NATIVE_EVM_ASSET_DECIMALS,
    )
  }

  return {
    isLoading,
    data: {
      isEnoughPaymentBalance,
      displayFeePaymentValue,
      displayEvmFeePaymentValue,
      feePaymentValue,
      feePaymentMeta,
      displayFeeExtra,
      acceptedFeePaymentAssets: acceptedFeePaymentAssetsIds,
      era,
      nonce: nonce.data,
      isLinkedAccount,
      storedReferralCode,
      tx: boundedTx,
      isNewReferralLink,
      shouldUsePermit,
      permitNonce: permitNonce.data,
      pendingPermit,
      txWeight,
    },
  }
}

export const useEditFeePaymentAsset = (
  acceptedFeePaymentAssets: string[],
  feePaymentAssetId?: string,
) => {
  const { t } = useTranslation()
  const feeAsPayment = useSetAsFeePayment()

  const {
    openModal: openEditFeePaymentAssetModal,
    modal: editFeePaymentAssetModal,
    isOpen: isOpenEditFeePaymentAssetModal,
  } = useAssetsModal({
    title: t("liquidity.reviewTransaction.modal.selectAsset"),
    hideInactiveAssets: true,
    confirmRequired: true,
    defaultSelectedAsssetId: feePaymentAssetId,
    allowedAssets: acceptedFeePaymentAssets,
    onSelect: (asset) => feeAsPayment.mutate(asset.id),
    withExternal: true,
  })

  return {
    openEditFeePaymentAssetModal,
    editFeePaymentAssetModal,
    isOpenEditFeePaymentAssetModal,
  }
}

export const useHealthFactorChangeFromTxMetadata = (
  txMetadata?: TradeMetadata,
) => {
  const { assetIn, assetOut, amountIn } = txMetadata || {}
  const amountOut = null
  return useHealthFactorChange({
    assetId: assetIn?.id || "",
    amount: amountIn || "",
    action: ProtocolAction.withdraw,
    swapAsset:
      assetOut && amountOut
        ? { assetId: assetOut.id, amount: amountOut }
        : undefined,
  })
}

export const useHealthFactorChangeFromTx = (
  tx: SubmittableExtrinsic<"promise">,
) => {
  const { getAsset } = useAssets()
  const assetFromTx = getAssetFromTx(tx)
  const assetIn = assetFromTx?.assetInId
    ? getAsset(assetFromTx.assetInId)
    : null

  const assetInId = assetIn ? assetIn.id : ""
  const amountIn =
    assetIn && assetFromTx?.amountIn
      ? BN(assetFromTx.amountIn).shiftedBy(-assetIn.decimals).toString()
      : ""

  const assetOut = assetFromTx?.assetOutId
    ? getAsset(assetFromTx.assetOutId)
    : null

  const assetOutId = assetOut ? assetOut.id : ""

  const amountOut =
    assetOut && assetFromTx?.amountOut
      ? BN(assetFromTx.amountOut).shiftedBy(-assetOut.decimals).toString()
      : ""

  return useHealthFactorChange({
    assetId: assetInId,
    amount: amountIn,
    action: ProtocolAction.withdraw,
    swapAsset:
      assetOutId && amountOut
        ? { assetId: assetOutId, amount: amountOut }
        : undefined,
  })
}

export const createPolkadotJSTxUrl = (
  rpcUrl: string,
  tx: SubmittableExtrinsic<"promise">,
) => {
  let url = ""
  try {
    url = `https://polkadot.js.org/apps/?rpc=${rpcUrl}#/extrinsics/decode/${tx.method.toHex()}`
  } catch (e) {}

  return url
}

export const usePolkadotJSTxUrl = (tx: SubmittableExtrinsic<"promise">) => {
  const provider = useProviderRpcUrlStore()

  const rpcUrl = encodeURIComponent(
    provider.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL,
  )

  return useMemo(() => {
    return createPolkadotJSTxUrl(rpcUrl, tx)
  }, [rpcUrl, tx])
}

const normalizeHumanizedString = (str: string) => str.replace(/,/g, "")

export function getAssetFromTx(tx: SubmittableExtrinsic<"promise">) {
  if (!tx) return null

  let assetInId = null
  let amountIn = null
  let assetOutId = null
  let amountOut = null
  try {
    const json: any = tx.method.toHuman()
    const isSwapCall =
      (json.method === "sell" || json.method === "buy") &&
      (json.section === "router" || json.section === "omnipool")

    const isTransferCall =
      json.method === "transfer" && json.section === "currencies"

    const isDcaCall = json.method === "schedule" && json.section === "dca"

    if (isSwapCall) {
      const amountInArg =
        json.args?.amount ||
        json.args?.amount_in ||
        json.args?.max_amount_in ||
        "0"

      const amountOutArg =
        json.args?.amount_out || json.args?.min_amount_out || "0"

      assetInId = normalizeHumanizedString(json.args.asset_in)
      amountIn = normalizeHumanizedString(amountInArg)
      assetOutId = normalizeHumanizedString(json.args.asset_out)
      amountOut = normalizeHumanizedString(amountOutArg)
    }

    if (isTransferCall) {
      assetInId = normalizeHumanizedString(json.args.currency_id)
      amountIn = normalizeHumanizedString(json.args.amount)
    }
    if (isDcaCall) {
      assetInId = normalizeHumanizedString(
        json.args.schedule.order.Sell.assetIn,
      )
      amountIn = normalizeHumanizedString(json.args.schedule.totalAmount)
    }
  } catch {
    return {
      assetInId,
      amountIn,
      assetOutId,
      amountOut,
    }
  }

  return {
    assetInId,
    amountIn,
    assetOutId,
    amountOut,
  }
}

import { useCallback, useMemo } from "react"
import { createToastMessages } from "state/toasts"
import { useStore } from "state/store"
import { useTranslation } from "react-i18next"
import { useBestTradeSell } from "api/trade"
import { useFormContext } from "react-hook-form"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useAssets } from "providers/assets"
import { useHealthFactorChange } from "api/borrow"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAddressFromAssetId } from "utils/evm"
import BN from "bignumber.js"
import { getSupplyCapData } from "sections/lending/hooks/useAssetCaps"
import { ProtocolAction } from "@aave/contract-helpers"
import { useRefetchMarketData } from "sections/lending/hooks/useRefetchMarketData"

export const useSubmitNewDepositForm = (assetId: string) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { getAssetWithFallback, getErc20 } = useAssets()
  const asset = getAssetWithFallback(assetId)
  const { reserves } = useAppDataContext()
  const refetchMarketData = useRefetchMarketData()

  const { watch } = useFormContext<NewDepositFormValues>()
  const [selectedAsset, amount] = watch(["asset", "amount"])

  const { amountOut, minAmountOut, getSwapTx } = useBestTradeSell(
    selectedAsset?.id ?? "",
    assetId,
    amount,
  )

  const healthFactorChange = useHealthFactorChange({
    assetId,
    action: ProtocolAction.supply,
    amount: BN(amountOut).shiftedBy(-asset.decimals).toString(),
    swapAsset: selectedAsset
      ? {
          assetId: selectedAsset.id,
          amount: amount,
        }
      : undefined,
  })

  const underlyingReserve = useMemo(() => {
    const erc20 = getErc20(assetId)
    const underlyingAssetId = erc20?.underlyingAssetId

    if (!underlyingAssetId) return undefined

    return reserves.find(
      (r) => r.underlyingAsset === getAddressFromAssetId(underlyingAssetId),
    )
  }, [assetId, getErc20, reserves])

  const supplyCapReached = useMemo(() => {
    if (!underlyingReserve) return false
    const supplyCap = getSupplyCapData(underlyingReserve)
    return !!supplyCap?.supplyCapReached
  }, [underlyingReserve])

  const submit = useCallback(async () => {
    const tx = await getSwapTx()

    return createTransaction(
      { tx },
      {
        onSuccess: refetchMarketData,
        toast: createToastMessages("wallet.strategy.deposit.toast", {
          t,
          tOptions: {
            strategy: asset.name,
            amount: amount,
            symbol: selectedAsset?.symbol,
          },
          components: ["span.highlight"],
        }),
      },
    )
  }, [
    amount,
    asset.name,
    createTransaction,
    selectedAsset?.symbol,
    getSwapTx,
    refetchMarketData,
    t,
  ])

  return {
    minAmountOut,
    submit,
    getSwapTx,
    healthFactorChange,
    underlyingReserve,
    supplyCapReached,
  }
}

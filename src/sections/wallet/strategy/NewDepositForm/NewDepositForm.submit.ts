import { useCallback, useMemo } from "react"
import { createToastMessages } from "state/toasts"
import { useStore } from "state/store"
import { useTranslation } from "react-i18next"
import { useBestTradeSell } from "api/trade"
import { useFormContext } from "react-hook-form"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useAssets } from "providers/assets"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import { useOnNextNetworkUpdate } from "sections/lending/hooks/app-data-provider/useOnNextNetworkUpdate"
import { useHealthFactorChange } from "api/borrow"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAddressFromAssetId } from "utils/evm"
import BN from "bignumber.js"
import { getSupplyCapData } from "sections/lending/hooks/useAssetCaps"
import { ProtocolAction } from "@aave/contract-helpers"

export const useSubmitNewDepositForm = (assetId: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { createTransaction } = useStore()
  const { getAssetWithFallback, getErc20 } = useAssets()
  const asset = getAssetWithFallback(assetId)
  const { reserves } = useAppDataContext()
  const { refetchPoolData, refetchIncentiveData } = useBackgroundDataProvider()
  const onNextNetworkUpdate = useOnNextNetworkUpdate()

  const { watch } = useFormContext<NewDepositFormValues>()
  const [selectedAsset, amount] = watch(["asset", "amount"])

  const { amountOut, minAmountOut, swapTx } = useBestTradeSell(
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
    if (!erc20) return undefined

    return reserves.find(
      (r) =>
        r.underlyingAsset === getAddressFromAssetId(erc20.underlyingAssetId),
    )
  }, [assetId, getErc20, reserves])

  const supplyCapReached = useMemo(() => {
    if (!underlyingReserve) return false
    const supplyCap = getSupplyCapData(underlyingReserve)
    return !!supplyCap?.supplyCapReached
  }, [underlyingReserve])

  const submit = useCallback(
    () =>
      createTransaction(
        { tx: swapTx },
        {
          onSuccess: () => {
            onNextNetworkUpdate(() => {
              queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
              refetchPoolData?.()
              refetchIncentiveData?.()
            })
          },
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
      ),
    [
      amount,
      asset.name,
      createTransaction,
      onNextNetworkUpdate,
      queryClient,
      refetchIncentiveData,
      refetchPoolData,
      selectedAsset?.symbol,
      swapTx,
      t,
    ],
  )

  return {
    minAmountOut,
    submit,
    healthFactorChange,
    underlyingReserve,
    supplyCapReached,
  }
}

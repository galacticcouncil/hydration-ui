import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { ModalHorizontalSeparator } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { useRemoveDepositForm } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositModal.form"
import { RemoveDepositSummary } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositSummary"
import { RemoveDepositAmount } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAmount"
import { RemoveDepositAsset } from "sections/wallet/strategy/RemoveDepositModal/RemoveDepositAsset"
import { useHealthFactorChange, useUserBorrowSummary } from "api/borrow"
import { useAssets } from "providers/assets"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useBestTradeSell } from "api/trade"
import { useStore } from "state/store"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { createToastMessages } from "state/toasts"
import { ProtocolAction } from "@aave/contract-helpers"
import { useNewDepositAssets } from "sections/wallet/strategy/NewDepositForm/NewDepositAssetSelector.utils"
import { useStableSwapReserves } from "sections/pools/PoolsPage.utils"
import { useWithdrawAndSellAll } from "sections/lending/components/transactions/Withdraw/utils"
import { getAddressFromAssetId } from "utils/evm"
import BN from "bignumber.js"

type Props = {
  readonly assetId: string
  readonly balance: string
  readonly maxBalance: string
  readonly onClose: () => void
}

export const RemoveDepositModal: FC<Props> = ({
  assetId,
  balance,
  maxBalance,
  onClose,
}) => {
  const { createTransaction } = useStore()
  const { getErc20, getAsset, getAssetWithFallback, hub } = useAssets()
  const { t } = useTranslation()
  const { data: user } = useUserBorrowSummary()

  const asset = getAssetWithFallback(assetId)

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const underlyingAssetId = getErc20(assetId)?.underlyingAssetId ?? ""

  const { data: pool } = useStableSwapReserves(underlyingAssetId)

  const uderlyingAsset = getAsset(underlyingAssetId)
  const firstAssetIdInPool = uderlyingAsset?.isStableSwap
    ? Object.keys(uderlyingAsset?.meta ?? {})[0]
    : ""

  const defaultAssetReceivedId =
    pool?.biggestPercentage?.assetId || // prioritize asset with biggest percentage in pool
    getErc20(firstAssetIdInPool)?.underlyingAssetId || // if first asset is aToken, fallback to its underlying asset
    firstAssetIdInPool // fallback to first asset in pool

  const form = useRemoveDepositForm({
    maxBalance,
    assetReceiveId: defaultAssetReceivedId,
  })

  const selectableAssets = useNewDepositAssets(underlyingAssetId, {
    blacklist: [assetId, hub.id],
    firstAssetId: defaultAssetReceivedId,
    lowPriorityAssetIds: [underlyingAssetId],
    underlyingAssetsFirst: true,
  })

  const [assetReceived, assetAmount] = form.watch(["assetReceived", "amount"])

  const underlyingUserReserve = user?.userReservesData.find(
    ({ underlyingAsset }) =>
      underlyingAsset === getAddressFromAssetId(underlyingAssetId),
  )

  const isWithdrawingMax = BN(assetAmount).gte(balance)

  const [debouncedAmount] = useDebouncedValue(assetAmount, 300)

  const {
    minAmountOut,
    getSwapTx,
    amountOut,
    isLoading: isLoadingSell,
  } = useBestTradeSell(assetId, assetReceived?.id ?? "", debouncedAmount)

  const {
    isLoading: isLoadingWithdrawAndSellAll,
    mutateAsync: getWithdrawAndSellAllTx,
  } = useWithdrawAndSellAll(
    underlyingUserReserve?.underlyingAsset ?? "",
    underlyingUserReserve?.reserve?.aTokenAddress ?? "",
    assetReceived?.id ?? "",
    debouncedAmount,
  )

  const { page, direction, paginateTo } = useModalPagination()

  const amountOutFormatted = new BigNumber(amountOut)
    .shiftedBy(-(assetReceived?.decimals ?? 0))
    .toString()

  const minAmountOutFormatted = new BigNumber(minAmountOut)
    .shiftedBy(-(assetReceived?.decimals ?? 0))
    .toString()

  const onSubmit = async () => {
    const tx = isWithdrawingMax
      ? await getWithdrawAndSellAllTx()
      : await getSwapTx()

    createTransaction(
      { tx },
      {
        toast: createToastMessages("wallet.strategy.remove.toast", {
          t,
          tOptions: {
            strategy: asset.name,
            amount: amountOutFormatted,
            symbol: assetReceived?.symbol,
          },
          components: ["span.highlight"],
        }),
      },
    )
  }

  const hfChange = useHealthFactorChange({
    assetId,
    amount: assetAmount,
    action: ProtocolAction.withdraw,
    swapAsset: assetReceived
      ? {
          assetId: assetReceived.id,
          amount: amountOutFormatted,
        }
      : undefined,
  })

  const displayRiskCheckbox = !!hfChange?.isHealthFactorBelowThreshold

  const isLoading = isWithdrawingMax
    ? isLoadingWithdrawAndSellAll
    : isLoadingSell

  const isSubmitDisabled = displayRiskCheckbox
    ? !healthFactorRiskAccepted
    : false

  return (
    <ModalContents
      page={page}
      direction={direction}
      onClose={onClose}
      onBack={() => paginateTo(0)}
      contents={[
        {
          title: t("lending.withdraw.modal.title", {
            symbol: asset.symbol,
          }),
          content: (
            <FormProvider {...form}>
              <form
                sx={{ display: "grid" }}
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div sx={{ flex: "column", gap: 8 }}>
                  <div sx={{ flex: "column", gap: 16 }}>
                    <RemoveDepositAmount
                      assetId={assetId}
                      balance={balance}
                      maxBalance={maxBalance}
                    />
                    <RemoveDepositAsset
                      assetId={assetReceived?.id ?? ""}
                      amountOut={amountOutFormatted}
                      onSelectorOpen={() => paginateTo(1)}
                    />
                  </div>
                  <RemoveDepositSummary
                    assetId={assetId}
                    hfChange={hfChange}
                    minReceived={minAmountOutFormatted}
                    assetReceived={assetReceived}
                  />
                </div>
                {hfChange && (
                  <HealthFactorRiskWarning
                    accepted={healthFactorRiskAccepted}
                    onAcceptedChange={setHealthFactorRiskAccepted}
                    isBelowThreshold={hfChange.isHealthFactorBelowThreshold}
                    sx={{ mb: 16 }}
                  />
                )}
                <ModalHorizontalSeparator mb={16} />
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isSubmitDisabled || isLoading}
                >
                  {t("wallet.strategy.remove.confirm")}
                </Button>
              </form>
            </FormProvider>
          ),
        },
        {
          title: t("selectAsset.title"),
          noPadding: true,
          content: (
            <AssetsModalContent
              hideInactiveAssets
              naturallySorted
              displayZeroBalance
              allowedAssets={selectableAssets}
              onSelect={(asset) => {
                form.setValue("assetReceived", asset, { shouldValidate: true })
                paginateTo(0)
              }}
            />
          ),
        },
      ]}
    />
  )
}

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
import { useHealthFactorChange, useMaxWithdrawAmount } from "api/borrow"
import { useAssets } from "providers/assets"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { useDebouncedValue } from "hooks/useDebouncedValue"
import { useBestTradeSell } from "api/trade"
import { useStore } from "state/store"
import { HealthFactorRiskWarning } from "sections/lending/components/Warnings/HealthFactorRiskWarning"
import { createToastMessages } from "state/toasts"

type Props = {
  readonly assetId: string
  readonly balance: string
  readonly onClose: () => void
}

export const RemoveDepositModal: FC<Props> = ({
  assetId,
  balance,
  onClose,
}) => {
  const { createTransaction } = useStore()
  const { tradable, getAssetWithFallback } = useAssets()
  const { t } = useTranslation()

  const asset = getAssetWithFallback(assetId)

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const maxBalanceToWithdraw = useMaxWithdrawAmount(assetId)
  const maxBalance = BigNumber.min(maxBalanceToWithdraw, balance).toString()

  const form = useRemoveDepositForm({ maxBalance })
  const [assetReceived, balanceAmount] = form.watch(["assetReceived", "amount"])

  const hfChange = useHealthFactorChange(assetId, balanceAmount)

  const [debouncedBalance] = useDebouncedValue(balanceAmount, 300)

  const { minAmountOut, swapTx, amountOut } = useBestTradeSell(
    assetId,
    assetReceived?.id ?? "",
    debouncedBalance,
  )

  const { page, direction, paginateTo } = useModalPagination()

  const amountOutFormatted = new BigNumber(amountOut)
    .shiftedBy(-(assetReceived?.decimals ?? 0))
    .toString()

  const minAmountOutFormatted = new BigNumber(minAmountOut)
    .shiftedBy(-(assetReceived?.decimals ?? 0))
    .toString()

  const onSubmit = () => {
    createTransaction(
      { tx: swapTx },
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

  const displayRiskCheckbox = !!hfChange?.isHealthFactorBelowThreshold

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
          title: t("wallet.strategy.remove.title"),
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
                      balance={maxBalance}
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
                {displayRiskCheckbox && (
                  <HealthFactorRiskWarning
                    accepted={healthFactorRiskAccepted}
                    onAcceptedChange={setHealthFactorRiskAccepted}
                    sx={{ mb: 16 }}
                  />
                )}
                <ModalHorizontalSeparator mb={16} />
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitDisabled}
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
              allAssets
              hideInactiveAssets
              allowedAssets={tradable
                .map((asset) => asset.id)
                .filter(
                  (assetId) =>
                    assetId !== GDOT_ERC20_ASSET_ID &&
                    assetId !== GDOT_STABLESWAP_ASSET_ID,
                )}
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

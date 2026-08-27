import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  AssetInput,
  LoadingButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { useEvmAddress } from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { Controller } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useBorrowHollarForm } from "@/modules/strategies/bil/components/BorrowHollarModal.form"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { useBilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import { useBorrowHollar } from "@/modules/strategies/bil/hooks/useBilPoolWrites"
import { getBilBorrowHealthFactor } from "@/modules/strategies/bil/utils/hf"

interface Props {
  open: boolean
  onClose: () => void
}

export const BorrowHollarModal = ({ open, onClose }: Props) => {
  const { t } = useTranslation(["strategies", "borrow", "common"])

  const { hollar } = useBilStrategy()

  const evmAddress = useEvmAddress()
  const { data: poolPosition } = useBilPoolPosition(evmAddress)
  const borrowMutation = useBorrowHollar({ onClose })

  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const hasCollateral = !!poolPosition?.hasCollateral

  const { control, handleSubmit, watch, formState } = useBorrowHollarForm({
    maxBorrowable: availableUsd.toString(),
  })

  const amount = watch("amount")
  const inputAmount = amount || "0"

  const healthFactor = poolPosition
    ? getBilBorrowHealthFactor(poolPosition, inputAmount)
    : null
  const isLiquidationRisk =
    !!healthFactor &&
    !Big(healthFactor.future).eq(-1) &&
    Big(healthFactor.future).lte(1)

  const canSubmit =
    formState.isValid &&
    !isLiquidationRisk &&
    !borrowMutation.isPending &&
    hasCollateral

  const onSubmit = handleSubmit(({ amount }) => {
    if (!canSubmit) return
    borrowMutation.mutate(amount)
  })

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("bil.borrow.title")} />

      <form onSubmit={onSubmit}>
        <ModalBody>
          <Controller
            control={control}
            name="amount"
            render={({ field, fieldState }) => (
              <AssetInput
                sx={{ pt: 0 }}
                label={t("bil.borrow.selectAsset")}
                balanceLabel={t("common:available")}
                symbol={hollar.symbol}
                selectedAssetIcon={<AssetLogo id={hollar.id} size="medium" />}
                modalDisabled
                value={field.value}
                onChange={field.onChange}
                displayValue={t("common:currency", {
                  value: inputAmount,
                })}
                maxBalance={availableUsd.toString()}
                maxButtonBalance={availableUsd.toString()}
                amountError={fieldState.error?.message}
              />
            )}
          />

          {healthFactor && hasCollateral && (
            <Summary
              withLeadingSeparator
              separator={<ModalContentDivider />}
              mb="var(--modal-content-inset)"
            >
              <SummaryRow
                label={t("common:healthFactor")}
                content={<HealthFactorChange {...healthFactor} />}
              />
            </Summary>
          )}
        </ModalBody>

        <ModalFooter>
          <LoadingButton
            type="submit"
            size="large"
            width="100%"
            isLoading={borrowMutation.isPending}
            disabled={!canSubmit}
          >
            {t("borrow:borrow")} {hollar.symbol}
          </LoadingButton>
        </ModalFooter>
      </form>
    </Modal>
  )
}

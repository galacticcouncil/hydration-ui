import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import {
  AssetInput,
  Button,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"
import type { BilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import { getBilBorrowHealthFactor } from "@/modules/strategies/bil/utils/hf"

interface Props {
  open: boolean
  onClose: () => void
  poolPosition: BilPoolPosition | undefined
  onBorrow: (amount: number) => void
  isPending: boolean
}

export const BorrowHollarModal = ({
  open,
  onClose,
  poolPosition,
  onBorrow,
  isPending,
}: Props) => {
  const { t } = useTranslation(["strategies", "borrow", "common"])
  const [amount, setAmount] = useState("")

  const { hollar } = useBilStrategy()

  const inputNum = parseFloat(amount) || 0

  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const hasCollateral = !!poolPosition?.hasCollateral

  const overAvailable = inputNum > availableUsd
  const healthFactor = poolPosition
    ? getBilBorrowHealthFactor(poolPosition, inputNum)
    : null
  const isLiquidationRisk =
    !!healthFactor &&
    !Big(healthFactor.future).eq(-1) &&
    Big(healthFactor.future).lte(1)

  const canSubmit =
    inputNum > 0 &&
    !overAvailable &&
    !isLiquidationRisk &&
    !isPending &&
    hasCollateral

  const handleSubmit = () => {
    if (!canSubmit) return
    onBorrow(inputNum)
  }

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("bil.borrow.title")} />

      <ModalBody>
        <AssetInput
          sx={{ pt: 0 }}
          label={t("bil.borrow.selectAsset")}
          balanceLabel={t("common:available")}
          symbol={hollar.symbol}
          selectedAssetIcon={<AssetLogo id={hollar.id} size="medium" />}
          modalDisabled
          value={amount}
          onChange={setAmount}
          displayValue={t("common:currency", {
            value: inputNum,
          })}
          maxBalance={availableUsd.toString()}
          maxButtonBalance={availableUsd.toString()}
          amountError={overAvailable ? t("bil.borrow.cta.exceeds") : undefined}
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
        <Button
          size="large"
          width="100%"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {t("borrow:borrow")} {hollar.symbol}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

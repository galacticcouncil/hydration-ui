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
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import Big from "big.js"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import type { HdclPoolPosition } from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"
import { getHdclBorrowHealthFactor } from "@/modules/strategies/hdcl/utils/hf"
import { useAssets } from "@/providers/assetsProvider"

interface Props {
  open: boolean
  onClose: () => void
  poolPosition: HdclPoolPosition | undefined
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

  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  const inputNum = parseFloat(amount) || 0

  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const hasCollateral = !!poolPosition?.hasCollateral

  const overAvailable = inputNum > availableUsd
  const healthFactor = poolPosition
    ? getHdclBorrowHealthFactor(poolPosition, inputNum)
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
      <ModalHeader title={t("hdcl.borrow.title")} />

      <ModalBody>
        <AssetInput
          sx={{ pt: 0 }}
          label={t("hdcl.borrow.selectAsset")}
          balanceLabel="Available"
          symbol="HOLLAR"
          selectedAssetIcon={<AssetLogo id={HOLLAR_ASSET_ID} size="medium" />}
          modalDisabled
          value={amount}
          onChange={setAmount}
          displayValue={t("common:currency", {
            value: inputNum,
          })}
          maxBalance={availableUsd.toString()}
          maxButtonBalance={availableUsd.toString()}
          amountError={overAvailable ? t("hdcl.borrow.cta.exceeds") : undefined}
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

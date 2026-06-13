import {
  AssetInput,
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import type { BilPoolPosition } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import { useAssets } from "@/providers/assetsProvider"

interface Props {
  open: boolean
  onClose: () => void
  poolPosition: BilPoolPosition | undefined
  onBorrow: (amount: number) => void
  isPending: boolean
}

const HEALTH_LIQUIDATION_THRESHOLD = 1.0
const HEALTH_WARNING_THRESHOLD = 1.5

export const BorrowHollarModal = ({
  open,
  onClose,
  poolPosition,
  onBorrow,
  isPending,
}: Props) => {
  const { t } = useTranslation(["bil", "borrow", "common"])
  const [amount, setAmount] = useState("")

  const { getAssetWithFallback } = useAssets()
  const hollar = getAssetWithFallback(HOLLAR_ASSET_ID)

  const inputNum = parseFloat(amount) || 0

  const totalCollateralUsd = poolPosition?.totalCollateralUsd ?? 0
  const totalDebtUsd = poolPosition?.totalDebtUsd ?? 0
  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const liquidationThresholdPct = poolPosition?.liquidationThresholdPct ?? 0
  const hasCollateral = !!poolPosition?.hasCollateral

  const overAvailable = inputNum > availableUsd
  const projectedDebtUsd = totalDebtUsd + inputNum
  const projectedHf =
    projectedDebtUsd > 0
      ? (totalCollateralUsd * (liquidationThresholdPct / 100)) /
        projectedDebtUsd
      : Infinity

  const isLiquidationRisk = projectedHf <= HEALTH_LIQUIDATION_THRESHOLD
  const isWarning = projectedHf <= HEALTH_WARNING_THRESHOLD

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

  const hfText =
    projectedHf === Infinity
      ? "∞"
      : projectedHf > 999
        ? ">999"
        : projectedHf.toFixed(2)

  const hfColor = isLiquidationRisk
    ? getToken("accents.danger.emphasis")
    : isWarning
      ? getToken("accents.alert.primary")
      : getToken("accents.success.emphasis")

  return (
    <Modal variant="popup" open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalHeader title={t("borrow.title")} />

      <ModalBody noPadding>
        <Box px="xl" py="l">
          <AssetInput
            label={t("borrow.selectAsset")}
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
            amountError={overAvailable ? t("borrow.cta.exceeds") : undefined}
          />
        </Box>

        <ModalContentDivider />

        <Box px="xl" py="l">
          <Flex justify="space-between" align="center">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("borrow.healthFactor")}
            </Text>
            <Flex align="baseline" gap="xs">
              <Text fs="p4" fw={600} color={hfColor}>
                {hfText}
              </Text>
              <Text fs="p6">{t("borrow.liquidationAt")}</Text>
            </Flex>
          </Flex>
        </Box>
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

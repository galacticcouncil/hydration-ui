import {
  Alert,
  Box,
  Button,
  Checkbox,
  Flex,
  MicroButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { STokenPill } from "@/modules/hdcl-vault/HdclVault.styled"
import type { HdclPoolPosition } from "@/modules/hdcl-vault/hooks/useHdclPoolPosition"
import {
  formatInputDisplay,
  formatNumber,
} from "@/modules/hdcl-vault/utils/format"

interface Props {
  open: boolean
  onClose: () => void
  /** Live HDCL Aave pool position — drives health factor, available borrow, etc. */
  poolPosition: HdclPoolPosition | undefined
  onBorrow: (amount: number) => void
  isPending: boolean
}

const HEALTH_LIQUIDATION_THRESHOLD = 1.0
/** Below this we mark the projected HF as "warning" (orange). */
const HEALTH_WARNING_THRESHOLD = 1.5

/**
 * Borrow HOLLAR modal — Figma 7526:33883.
 *
 * Single-purpose modal: borrow HOLLAR against the user's HDCL collateral
 * on the HDCL Aave pool. Asset is locked to HOLLAR (no selector — there's
 * only one borrowable asset on this pool).
 *
 * Health factor projection:
 *   newHF = (totalCollateralUsd × liquidationThresholdPct/100) /
 *           (totalDebtUsd + amountToBorrow)
 *
 * Disabled until the user supplies HDCL as collateral first (the pool
 * separates supply from borrow — supply happens through the regular
 * money-market UI on the same network, not on this strategy page).
 */
export const BorrowHollarModal = ({
  open,
  onClose,
  poolPosition,
  onBorrow,
  isPending,
}: Props) => {
  const { t } = useTranslation("hdcl")
  const [amount, setAmount] = useState("")
  const [acknowledged, setAcknowledged] = useState(false)

  useEffect(() => {
    if (!open) {
      setAmount("")
      setAcknowledged(false)
    }
  }, [open])

  const inputNum = parseFloat(amount) || 0

  // Pool data with safe defaults — modal can render before reads resolve.
  const totalCollateralUsd = poolPosition?.totalCollateralUsd ?? 0
  const totalDebtUsd = poolPosition?.totalDebtUsd ?? 0
  const availableUsd = poolPosition?.availableBorrowsUsd ?? 0
  const liquidationThresholdPct = poolPosition?.liquidationThresholdPct ?? 0
  const hasCollateral = !!poolPosition?.hasCollateral

  // HOLLAR is $-pegged so amount-in-HOLLAR ≈ amount-in-USD.
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
    acknowledged &&
    !isPending &&
    hasCollateral

  const ctaLabel = (() => {
    if (isPending) return t("borrow.cta.pending")
    if (!hasCollateral) return t("borrow.cta.noCollateral")
    if (overAvailable) return t("borrow.cta.exceeds")
    if (isLiquidationRisk) return t("borrow.cta.liquidate")
    return t("borrow.cta.borrow")
  })()

  const handleSubmit = () => {
    if (!canSubmit) return
    onBorrow(inputNum)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, "").replace(/,/g, ".")
    if (raw === "" || !isNaN(Number(raw))) setAmount(raw)
  }

  const hfText =
    projectedHf === Infinity
      ? "∞"
      : projectedHf > 999
        ? ">999"
        : formatNumber(projectedHf, 2)

  const hfColor = isLiquidationRisk
    ? "accents.danger.primary"
    : isWarning
      ? "accents.alert.primary"
      : "accents.success.emphasis"

  return (
    <Modal variant="popup" open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalHeader title={t("borrow.title")} />

      <ModalBody sx={{ p: 0 }}>
        <Box px="xl" py="l">
          {/* Amount section */}
          <Flex justify="space-between" align="center" sx={{ mb: "s" }}>
            <Text fs="p5" fw={500} color={getToken("text.medium")}>
              {t("borrow.selectAsset")}
            </Text>
            <Flex align="center" gap={6}>
              <Text fs="p5" color={getToken("text.low")}>
                {t("borrow.available", {
                  value: formatNumber(availableUsd, 2),
                })}
              </Text>
              <MicroButton
                onClick={() => setAmount(availableUsd.toString())}
                disabled={availableUsd <= 0}
                aria-label={t("borrow.maxAria")}
              >
                {t("borrow.max")}
              </MicroButton>
            </Flex>
          </Flex>

          <Flex justify="space-between" align="center" gap={12}>
            <STokenPill>
              <AssetLogo id={HOLLAR_ASSET_ID} size="medium" />
              <Text fs="p3" fw={600} color={getToken("text.high")}>
                HOLLAR
              </Text>
            </STokenPill>
            <Flex direction="column" align="flex-end" sx={{ flex: 1 }}>
              <input
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={formatInputDisplay(amount)}
                onChange={handleAmountChange}
                placeholder="0"
                css={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  textAlign: "right" as const,
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  color: "#fff",
                  width: "100%",
                  padding: 0,
                }}
              />
              {inputNum > 0 && (
                <Text fs="p6" color={getToken("text.low")}>
                  ${formatNumber(inputNum, 2)}
                </Text>
              )}
            </Flex>
          </Flex>
        </Box>

        <ModalContentDivider />

        {/* Health factor + risk surface */}
        <Box px="xl" py="l">
          <Flex justify="space-between" align="center">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("borrow.healthFactor")}
            </Text>
            <Flex align="baseline" gap={6}>
              <Text fs="p4" fw={600} color={hfColor}>
                {hfText}
              </Text>
              <Text fs="p6" color="accents.info.primary">
                {t("borrow.liquidationAt")}
              </Text>
            </Flex>
          </Flex>

          <Flex align="flex-start" gap={8} sx={{ mt: "m" }}>
            <Checkbox
              name="borrow-ack"
              checked={acknowledged}
              onCheckedChange={(c) => setAcknowledged(!!c)}
            />
            <Text
              fs="p5"
              color={getToken("text.medium")}
              css={{ cursor: "pointer" }}
              onClick={() => setAcknowledged((v) => !v)}
            >
              {t("borrow.ack")}
            </Text>
          </Flex>

          {/* Aave governance attention banner — Figma copy verbatim.
              Alert primitive uses `description` prop (not children) and has
              no sx — wrap in Box for spacing. */}
          <Box sx={{ mt: "m" }}>
            <Alert variant="info" description={t("borrow.attention")} />
          </Box>
        </Box>
      </ModalBody>

      <ModalFooter>
        <Button
          size="large"
          width="100%"
          disabled={!canSubmit}
          onClick={handleSubmit}
        >
          {ctaLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

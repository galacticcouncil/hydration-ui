import {
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
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { STokenPill } from "../HdclVault.styled"
import { useInstantQuote } from "../hooks/useStableswap"
import { usePreviewRedeem } from "../hooks/useVaultReads"
import { formatInputDisplay, formatNumber } from "../utils/format"
import { HdclLogo } from "./HdclLogo"
import {
  projectRate,
  WithdrawMethodPicker,
  type WithdrawMethod,
} from "./WithdrawMethodPicker"

interface VaultStats {
  exchangeRate: number
  worstCaseWaitDays: number
  /** Days until the next vault position matures (independent of queue contention). */
  nextMaturityDays: number
  minRedeem: number
  /** Vault APR % — used to project exchange rate forward to fulfillment. */
  apr: number
}

interface Props {
  open: boolean
  onClose: () => void
  vaultStats: VaultStats
  hdclBalance: number
  /** Queue-path submit. Calls vault.requestRedeem(amount). */
  onRequestRedeem: (amount: number) => void
  /** Instant-path submit. Routes through `useInstantRedeem` upstream. */
  onInstantRedeem?: (amount: number) => void
  /** Whether the instant-redeem path is operational. */
  instantAvailable: boolean
  isPending: boolean
}

/**
 * Withdraw HDCL modal — Figma 7526:34522 (with nested 35079 / 35082).
 *
 * Lets the user pick between two redemption methods (queue vs instant) and
 * submits the corresponding write call. The queue path is fully wired; the
 * instant path is gated until the secondary-market stableswap deploys
 * (Phase 5) — `instantAvailable` flips it on once a quote is available.
 */
export const WithdrawModal = ({
  open,
  onClose,
  vaultStats,
  hdclBalance,
  onRequestRedeem,
  onInstantRedeem,
  instantAvailable,
  isPending,
}: Props) => {
  const { t } = useTranslation("hdcl")
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState<WithdrawMethod>("queue")
  const [acknowledged, setAcknowledged] = useState(false)

  // Reset form whenever the modal closes so a re-open starts clean.
  useEffect(() => {
    if (!open) {
      setAmount("")
      setMethod("queue")
      setAcknowledged(false)
    }
  }, [open])

  const inputNum = parseFloat(amount) || 0
  const usdValue = inputNum * vaultStats.exchangeRate // HOLLAR is $-pegged
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minRedeem
  const overBalance = inputNum > hdclBalance

  // Total fees row: only meaningful for the queue path. Instant path has its
  // own discount/slippage breakdown inside the method picker, so we suppress
  // the redundant fees row when "instant" is selected.
  const [debouncedAmount] = useDebounce(inputNum, 250)
  const { data: previewHollar } = usePreviewRedeem(debouncedAmount)
  const totalFeesUsd =
    method === "queue" && previewHollar !== undefined && debouncedAmount > 0
      ? Math.max(0, debouncedAmount * vaultStats.exchangeRate - previewHollar)
      : undefined

  // Live instant-redeem quote. Computed against the queue's projected
  // payout so the user sees the discount they'd pay for instant exit.
  // Hook handles its own debouncing; only fires when amount > 0.
  const projectedQueueRate = projectRate(
    vaultStats.exchangeRate,
    vaultStats.apr,
    vaultStats.worstCaseWaitDays,
  )
  const queueHollarOut = inputNum * projectedQueueRate
  const { quote: instantQuote } = useInstantQuote(inputNum, queueHollarOut)

  const canSubmit =
    inputNum > 0 &&
    !isBelowMin &&
    !overBalance &&
    acknowledged &&
    !isPending &&
    (method === "queue" || (instantAvailable && !!onInstantRedeem))

  const ctaLabel = (() => {
    if (isPending) return t("withdraw.cta.pending")
    if (overBalance) return t("withdraw.cta.insufficient")
    if (isBelowMin)
      return t("withdraw.cta.belowMin", {
        min: formatNumber(vaultStats.minRedeem, 0),
      })
    if (method === "instant" && !instantAvailable)
      return t("withdraw.cta.unavailable")
    return t("withdraw.cta.withdraw")
  })()

  const handleSubmit = () => {
    if (!canSubmit) return
    if (method === "queue") onRequestRedeem(inputNum)
    else onInstantRedeem?.(inputNum)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, "").replace(/,/g, ".")
    if (raw === "" || !isNaN(Number(raw))) setAmount(raw)
  }

  return (
    <Modal variant="popup" open={open} onOpenChange={(o) => !o && onClose()}>
      <ModalHeader title={t("withdraw.title")} />

      <ModalBody sx={{ p: 0 }}>
        <Box px="xl" py="l">
          {/* Amount section */}
          <Flex justify="space-between" align="center" sx={{ mb: "s" }}>
            <Text fs="p5" fw={500} color={getToken("text.medium")}>
              {t("withdraw.amount")}
            </Text>
            <Flex align="center" gap={6}>
              <Text fs="p5" color={getToken("text.low")}>
                {t("withdraw.balance", { value: formatNumber(hdclBalance, 2) })}
              </Text>
              <MicroButton
                onClick={() => setAmount(hdclBalance.toString())}
                disabled={hdclBalance <= 0}
                aria-label={t("withdraw.maxAria")}
              >
                {t("withdraw.max")}
              </MicroButton>
            </Flex>
          </Flex>

          <Flex justify="space-between" align="center" gap={12}>
            <STokenPill>
              <HdclLogo size={20} />
              <Text fs="p3" fw={600} color={getToken("text.high")}>
                HDCL
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
                css={(theme: any) => ({
                  background: "none",
                  border: "none",
                  outline: "none",
                  textAlign: "right" as const,
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  fontFamily: "inherit",
                  color: theme.text?.high || "#fff",
                  width: "100%",
                  padding: 0,
                })}
              />
              {inputNum > 0 && (
                <Text fs="p6" color={getToken("text.low")}>
                  ${formatNumber(usdValue, 2)}
                </Text>
              )}
            </Flex>
          </Flex>
        </Box>

        <ModalContentDivider />

        {/* Method picker */}
        <Box px="xl" py="l">
          <Text fs="p5" fw={500} color={getToken("text.medium")} sx={{ mb: "m" }}>
            {t("withdraw.method")}
          </Text>
          <WithdrawMethodPicker
            selected={method}
            onSelect={setMethod}
            amountHdcl={inputNum}
            exchangeRate={vaultStats.exchangeRate}
            aprPercent={vaultStats.apr}
            worstCaseWaitDays={vaultStats.worstCaseWaitDays}
            nextMaturityDays={vaultStats.nextMaturityDays}
            instantQuote={instantQuote}
            instantAvailable={instantAvailable}
          />
        </Box>

        <ModalContentDivider />

        {/* Total fees + acknowledgment */}
        <Box px="xl" py="l">
          {totalFeesUsd !== undefined && (
            <Flex justify="space-between" align="center" sx={{ mb: "m" }}>
              <Text fs="p5" color={getToken("text.medium")}>
                {t("withdraw.totalFees")}
              </Text>
              <Text fs="p5" fw={500} color={getToken("text.high")}>
                ${formatNumber(totalFeesUsd, 2)}
              </Text>
            </Flex>
          )}

          <Flex align="flex-start" gap={8}>
            <Checkbox
              name="withdraw-ack"
              checked={acknowledged}
              onCheckedChange={(c) => setAcknowledged(!!c)}
            />
            <Text
              fs="p5"
              color={getToken("text.medium")}
              css={{ cursor: "pointer" }}
              onClick={() => setAcknowledged((v) => !v)}
            >
              {/* Acknowledgment copy is method-specific: the queue path
                  warns about lock-up, the instant path warns about pool
                  slippage. Same checkbox state — flips wording only. */}
              {method === "instant"
                ? t("withdraw.ackInstant")
                : t("withdraw.ack")}
            </Text>
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
          {ctaLabel}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

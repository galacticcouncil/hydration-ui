import { Hourglass, Lock, Zap } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  MicroButton,
  Paper,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { AssetLogo } from "@/components/AssetLogo"
import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { STokenPill } from "@/modules/hdcl-vault/HdclVault.styled"
import { usePreviewDeposit } from "@/modules/hdcl-vault/hooks/useVaultReads"
import {
  formatInputDisplay,
  formatNumber,
} from "@/modules/hdcl-vault/utils/format"

import { HdclLogo } from "./HdclLogo"

interface VaultStats {
  exchangeRate: number
  /**
   * Max lockup a *new* deposit can face — investment period + withdrawal
   * delay (≈ 62 days). Drives the "Lockup period: up to N days" copy
   * regardless of current queue state, because for new deposits the
   * relevant horizon is one full position cycle, not how long the queue is.
   */
  maxLockupDays: number
  minDeposit: number
  depositsPaused: boolean
}

interface Balances {
  hollar: number
  hdcl: number
}

interface Props {
  vaultStats: VaultStats
  balances: Balances
  /** Atomic deposit batch — handles approvals, vault.deposit, pool.supply
      in one signed substrate `Utility.batch_all`. See `useDeposit`. */
  onDeposit: (amount: number) => void
  isPending: boolean
}

/**
 * Right-rail "Your deposit" card — Figma 6402:24464.
 * Lets the user swap HOLLAR for HDCL via vault.deposit().
 *
 * Shows informational copy about the redemption mechanics (lockup, queue vs
 * instant) so users understand what exit options exist before they enter the
 * position. The actual redeem-method choice happens in the Withdraw modal,
 * not here.
 */
export const DepositPanel = ({
  vaultStats,
  balances,
  onDeposit,
  isPending,
}: Props) => {
  const { t } = useTranslation("hdcl")
  const { isConnected } = useAccount()
  const [amount, setAmount] = useState("")

  const inputNum = parseFloat(amount) || 0
  const outputHdcl =
    vaultStats.exchangeRate > 0 ? inputNum / vaultStats.exchangeRate : 0
  const isBelowMin = inputNum > 0 && inputNum < vaultStats.minDeposit

  // Fee = input HOLLAR − value of minted HDCL at current rate. HOLLAR is
  // $-pegged so the result is also USD. Debounce the on-chain read so we
  // don't hammer the RPC on every keystroke.
  const [debouncedAmount] = useDebounce(inputNum, 250)
  const { data: previewHdcl } = usePreviewDeposit(debouncedAmount)
  const totalFeesUsd =
    previewHdcl !== undefined && debouncedAmount > 0
      ? Math.max(0, debouncedAmount - previewHdcl * vaultStats.exchangeRate)
      : undefined

  // Approvals are handled inside the batched onDeposit (HOLLAR→VAULT and
  // HDCL→POOL allowances are checked + emitted as needed). The user signs
  // a single substrate batch — no separate Approve step in the UI.
  const handleSubmit = () => {
    if (
      !isConnected ||
      inputNum <= 0 ||
      isBelowMin ||
      vaultStats.depositsPaused
    )
      return
    onDeposit(inputNum)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\s+/g, "").replace(/,/g, ".")
    if (raw === "" || !isNaN(Number(raw))) setAmount(raw)
  }

  const ctaLabel = (() => {
    if (isPending) return t("deposit.cta.pending")
    if (vaultStats.depositsPaused) return t("deposit.cta.paused")
    if (isBelowMin)
      return t("deposit.cta.belowMin", {
        min: formatNumber(vaultStats.minDeposit, 0),
      })
    return t("deposit.cta.deposit")
  })()

  return (
    <Paper variant="plain" p={20}>
      <Flex direction="column" gap={16}>
        {/* Your deposit (HOLLAR input) */}
        <Flex direction="column" gap={8}>
          <Flex justify="space-between" align="center">
            <Text fs="p5" fw={500} color={getToken("text.medium")}>
              {t("deposit.your")}
            </Text>
            <Flex align="center" gap={6}>
              <Text fs="p5" color={getToken("text.low")}>
                {t("deposit.balance", {
                  value: formatNumber(balances.hollar, 2),
                })}
              </Text>
              <MicroButton
                onClick={() => setAmount(balances.hollar.toString())}
                disabled={balances.hollar <= 0}
                aria-label={t("deposit.maxAria")}
              >
                {t("deposit.max")}
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
          </Flex>
        </Flex>

        {/* Exchange rate hint */}
        <Flex justify="flex-end">
          <Text fs="p6" color={getToken("text.low")}>
            {t("deposit.price", {
              rate: formatNumber(vaultStats.exchangeRate, 4),
            })}
          </Text>
        </Flex>

        {/* You receive (HDCL preview) */}
        <Flex direction="column" gap={8}>
          <Text fs="p5" fw={500} color={getToken("text.medium")}>
            {t("deposit.youReceive")}
          </Text>
          <Flex justify="space-between" align="center" gap={12}>
            <STokenPill>
              <HdclLogo size={20} />
              <Text fs="p3" fw={600} color={getToken("text.high")}>
                HDCL
              </Text>
            </STokenPill>
            <Text
              fs="h6"
              fw={500}
              color={
                inputNum > 0 ? getToken("text.high") : getToken("text.low")
              }
              css={{ textAlign: "right" }}
            >
              {inputNum > 0 ? formatNumber(outputHdcl, 4) : "0"}
            </Text>
          </Flex>
        </Flex>

        {/* Lockup period */}
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={6}>
            <Lock size={14} />
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.lockup")}
            </Text>
          </Flex>
          <Text fs="p5" fw={500} color={getToken("text.high")}>
            {t("deposit.lockupValue", { days: vaultStats.maxLockupDays })}
          </Text>
        </Flex>

        {/* Redeem options (informational) */}
        <Flex direction="column" gap={8}>
          <Text fs="p5" color={getToken("text.medium")}>
            {t("deposit.redeemOptions")}
          </Text>
          <Flex justify="space-between" align="center" gap={8}>
            <Flex align="center" gap={6}>
              <Hourglass size={14} />
              <Text fs="p5" fw={500} color={getToken("text.high")}>
                {t("deposit.option.queue")}
              </Text>
            </Flex>
            <Text
              fs="p6"
              color={getToken("text.low")}
              css={{ textAlign: "right" }}
            >
              {t("deposit.option.queueValue", {
                days: vaultStats.maxLockupDays,
              })}
            </Text>
          </Flex>
          <Flex justify="space-between" align="center" gap={8}>
            <Flex align="center" gap={6}>
              <Zap size={14} />
              <Text fs="p5" fw={500} color={getToken("text.high")}>
                {t("deposit.option.instant")}
              </Text>
            </Flex>
            <Text
              fs="p6"
              color={getToken("text.low")}
              css={{ textAlign: "right" }}
            >
              {t("deposit.option.instantValue")}
            </Text>
          </Flex>
        </Flex>

        {/* CTA */}
        <AuthorizedAction size="large" width="100%">
          <Button
            size="large"
            width="100%"
            disabled={
              inputNum <= 0 ||
              isPending ||
              isBelowMin ||
              vaultStats.depositsPaused
            }
            onClick={handleSubmit}
          >
            {ctaLabel}
          </Button>
        </AuthorizedAction>

        {/* Total fees — derived from vault.previewDeposit(). Hidden until
            the user types an amount so the row appears in context. */}
        {totalFeesUsd !== undefined && (
          <Flex justify="space-between" align="center">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("deposit.totalFees")}
            </Text>
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              ${formatNumber(totalFeesUsd, 2)}
            </Text>
          </Flex>
        )}
      </Flex>
    </Paper>
  )
}

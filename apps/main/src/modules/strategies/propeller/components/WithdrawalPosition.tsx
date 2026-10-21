import {
  Chip,
  type ChipProps,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { type FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PendingPosition } from "@/components/PendingPosition"
import { DateText } from "@/components/RelativeDateText"
import { useVaultDisplayAsset } from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import {
  useClaim,
  usePendingClaimIds,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { getWithdrawalStateLabel } from "@/modules/strategies/propeller/utils/withdrawalState"

const statusVariants: Record<
  ReturnType<typeof getWithdrawalStateLabel>,
  ChipProps["variant"]
> = {
  pending: "orange",
  cooldown: "orange",
  settling: "amber",
  claimable: "green",
  claimed: "blue",
}

/**
 * The row's state is computed at fetch time from the block timestamp, but the
 * cooldown boundary is shown live — tick it over so the chip cannot keep
 * saying "Cooldown" after its own countdown has visibly expired.
 */
const useCooldownElapsed = (eligibleAt: number, inCooldown: boolean) => {
  const [elapsed, setElapsed] = useState(() => Date.now() >= eligibleAt)
  useEffect(() => {
    if (!inCooldown || elapsed) return
    const id = setInterval(() => {
      if (Date.now() >= eligibleAt) setElapsed(true)
    }, 3_000)
    return () => clearInterval(id)
  }, [eligibleAt, inCooldown, elapsed])
  return elapsed
}

/**
 * A partial claim is worth surfacing when a QUARTER of the request has freed
 * (claiming in quarters is a sane rhythm), or when the freed amount is large
 * in absolute terms (a whale's 5% should not wait for 25%). Below both, the
 * button only invites gas-wasting dust claims; the final claim always shows.
 */
const PARTIAL_CLAIM_MIN_FRACTION = 0.25
const PARTIAL_CLAIM_MIN_USD = 1_000

const partialClaimWorthwhile = (row: PropellerWithdrawalRow) => {
  const unclaimed = row.collateralSettled ?? 0
  const owed = row.collateralOwed ?? 0
  if (unclaimed <= 0) return false
  const price = row.estEth > 0 ? row.estUsd / row.estEth : 0
  return (
    (owed > 0 && unclaimed / owed >= PARTIAL_CLAIM_MIN_FRACTION) ||
    unclaimed * price >= PARTIAL_CLAIM_MIN_USD
  )
}

export const WithdrawalPosition: FC<{ row: PropellerWithdrawalRow }> = ({
  row,
}) => {
  const { t } = useTranslation(["propeller", "common"])
  // row amounts arrive already converted to the current display asset
  const displayAsset = useVaultDisplayAsset()(row.vault)
  const { symbol } = displayAsset
  const usd = t("common:currency", { value: row.estUsd })
  const claim = useClaim()
  const isClaiming = usePendingClaimIds().includes(row.id)
  const cooldownElapsed = useCooldownElapsed(
    row.eligibleAt,
    row.state === "cooldown",
  )
  // after the cooldown nothing is claimable yet: the request waits for the
  // keeper to start the unwind — say so instead of a dead countdown
  const state =
    row.state === "cooldown" && cooldownElapsed ? "pending" : row.state
  const rawStatus = getWithdrawalStateLabel({ ...row, state })
  // demote claimable back to settling while the freed amount is not worth a claim
  const status =
    rawStatus === "claimable" &&
    row.state === "partial" &&
    row.surplusHollar <= 0 &&
    !partialClaimWorthwhile(row)
      ? "settling"
      : rawStatus
  const stats =
    state === "cooldown"
      ? [
          {
            label: t("withdrawals.eligibleAt"),
            value: <DateText date={new Date(row.eligibleAt)} />,
          },
        ]
      : row.state === "partial" && (row.collateralOwed ?? 0) > 0
        ? [
            {
              // the chip already says Settling and the row's amount is the
              // total owed; a compact settled-so-far is all this line adds
              label: t("withdrawals.settledLabel"),
              value: t("withdrawals.settledProgress", {
                settled: t("common:currency", {
                  value: row.settledSoFar ?? 0,
                  symbol,
                  maximumFractionDigits: 4,
                }),
                pct: (
                  ((row.settledSoFar ?? 0) / (row.collateralOwed || 1)) *
                  100
                ).toFixed(1),
              }),
            },
          ]
        : undefined

  return (
    <PendingPosition
      assetId={displayAsset.id}
      value={t("common:currency", { value: row.estEth, symbol })}
      displayValue={usd}
      isLoading={row.isSettlementLoading}
      stats={stats}
      status={
        status === "claimable" ? (
          <LoadingButton
            aria-label={t("withdrawals.claim.label", { symbol })}
            variant="secondary"
            size="small"
            loadingMode="replace"
            isLoading={isClaiming}
            disabled={isClaiming}
            onClick={() =>
              claim.mutate({ vault: row.vault, requestId: row.requestId })
            }
          >
            {row.state === "partial"
              ? t("withdrawals.action.claimPartial", {
                  amount: t("common:currency", {
                    value: row.collateralSettled ?? 0,
                    symbol,
                    maximumFractionDigits: 4,
                  }),
                })
              : t("withdrawals.action.claim")}
          </LoadingButton>
        ) : (
          <Chip variant={statusVariants[status]} size="small">
            {row.sourcePending && row.state === "claimed"
              ? t("withdrawals.recoveryPending")
              : t(`withdrawals.state.${status}`)}
          </Chip>
        )
      }
    />
  )
}

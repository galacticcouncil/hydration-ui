import {
  Chip,
  type ChipProps,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { type FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PendingPosition } from "@/components/PendingPosition"
import { DateText } from "@/components/RelativeDateText"
import { ClaimModal } from "@/modules/strategies/propeller/components/ClaimModal"
import { useVaultDisplayAsset } from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { vaultStatsQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  useClaim,
  usePendingClaimIds,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { getWithdrawalStateLabel } from "@/modules/strategies/propeller/utils/withdrawalState"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

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

/** coarse on purpose: the pace wobbles, so minutes beat false precision */
const formatEta = (seconds: number) => {
  if (seconds < 90) return "~1 min"
  if (seconds < 5400) return `~${Math.round(seconds / 60)} min`
  if (seconds < 172800) return `~${Math.round(seconds / 3600)} h`
  return `~${Math.round(seconds / 86400)} d`
}

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

type WithdrawalPositionProps = {
  row: PropellerWithdrawalRow
}

export const WithdrawalPosition: FC<WithdrawalPositionProps> = ({ row }) => {
  const { t } = useTranslation(["propeller", "common"])
  // row amounts arrive already converted to the current display asset
  const displayAsset = useVaultDisplayAsset()(row.vault)
  const { symbol } = displayAsset
  const usd = t("common:currency", { value: row.estUsd })
  const claim = useClaim()
  const [claimOpen, setClaimOpen] = useState(false)
  const hasPayoutChoice = !!row.vault.payoutAssetIds
  const isClaiming = usePendingClaimIds().includes(row.id)
  // claim() is whenNotPaused, and the vault's paused() includes a loop
  // emergency pause — while either holds, the call can only revert
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { data: vaultStats } = useQuery(
    vaultStatsQuery(
      rpc,
      row.vault,
      getAssetWithFallback(row.vault.assetId).decimals,
    ),
  )
  const claimPaused = vaultStats?.paused === true
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
      : // a claim button already names the settled amount, and next to it
        // the stat overflows the card — show it only while there is no button
        row.state === "partial" &&
          (row.collateralOwed ?? 0) > 0 &&
          status !== "claimable"
        ? [
            {
              // two lines, mirroring the amount column: what has settled, then
              // when the rest is expected. The chip already says Settling.
              value: t("withdrawals.settledInline", {
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
              // the pace is measured from recent tranches and decays through
              // stalls — "at the current pace", never a promise
              bottomLabel:
                row.etaSeconds !== null
                  ? t("withdrawals.etaAtPace", {
                      eta: formatEta(row.etaSeconds),
                    })
                  : row.typicalSettleSeconds !== null
                    ? t("withdrawals.etaTypical", {
                        eta: formatEta(row.typicalSettleSeconds),
                      })
                    : undefined,
            },
          ]
        : undefined

  return (
    <>
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
              disabled={isClaiming || claimPaused}
              onClick={() =>
                hasPayoutChoice
                  ? setClaimOpen(true)
                  : claim.mutate({ vault: row.vault, requestId: row.requestId })
              }
            >
              {claimPaused
                ? t("withdrawals.action.claimPaused")
                : row.state === "partial"
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
      {hasPayoutChoice && (
        <ClaimModal
          row={row}
          open={claimOpen}
          onClose={() => setClaimOpen(false)}
        />
      )}
    </>
  )
}

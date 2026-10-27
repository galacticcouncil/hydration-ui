import {
  Chip,
  type ChipProps,
  Flex,
  LoadingButton,
  Text,
  ValueStatsLabel,
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
import { formatEta } from "@/modules/strategies/propeller/utils/withdrawalEta"
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
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!inCooldown) return
    // flip exactly when the countdown reaches zero, never "1s ago"; re-arms
    // when a reorg moves the request (and with it eligibleAt)
    const wait = Math.max(eligibleAt - Date.now(), 0)
    const id = setTimeout(() => setNow(Date.now()), wait)
    return () => clearTimeout(id)
  }, [eligibleAt, inCooldown])
  return now >= eligibleAt
}

type WithdrawalPositionProps = {
  row: PropellerWithdrawalRow
}

export const WithdrawalPosition: FC<WithdrawalPositionProps> = ({ row }) => {
  const { t } = useTranslation(["propeller", "common"])
  // row amounts arrive already converted to the current display asset
  const displayAsset = useVaultDisplayAsset()(row.vault)
  const { symbol } = displayAsset
  // estEth already speaks for what is still coming on an open request (owed
  // minus earlier partial claims) and for the total paid on a closed one
  const remaining = row.estEth
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
  // anything settled is claimable: the contract takes any amount, so the UI
  // never holds a partial claim back
  const status = getWithdrawalStateLabel({ ...row, state })
  // when the whole withdrawal is claimable: measured keeper pace behind the
  // queue ahead — an estimate, so it is shown coarse and never as a promise
  const eta =
    row.claimableInSeconds !== null ? formatEta(row.claimableInSeconds) : null
  const etaLine = row.reserveShort
    ? t("withdrawals.eta.reserve")
    : eta
      ? t("withdrawals.eta.claimableIn", { eta })
      : undefined
  const stats =
    state === "cooldown"
      ? [
          {
            // two lines like a settling row: the Cooldown chip names the
            // countdown, the line under it says when everything is claimable
            value: <DateText date={new Date(row.eligibleAt)} />,
            bottomLabel: etaLine,
          },
        ]
      : status === "pending" && etaLine
        ? [
            {
              // label above the value at every width: beside the value and
              // the chip, the label leaves a narrow phone no room
              value: (
                <Flex direction="column" align="flex-end">
                  <ValueStatsLabel>
                    {t("withdrawals.eta.label")}
                  </ValueStatsLabel>
                  <Text as="span" whiteSpace="nowrap">
                    {row.reserveShort ? t("withdrawals.eta.reserveShort") : eta}
                  </Text>
                </Flex>
              ),
              tooltip: row.reserveShort
                ? t("withdrawals.eta.reserveTooltip")
                : undefined,
            },
          ]
        : // a claim button already names the settled amount, and next to it
          // the stat overflows the card — show it only while there is no button
          row.state === "partial" &&
            (row.collateralOwed ?? 0) > 0 &&
            status !== "claimable"
          ? [
              {
                // two lines, mirroring the amount column: what has settled,
                // then when the rest is expected. The chip already says
                // Settling. Progress of the whole withdrawal, claimed parts
                // included, so a partial claim never looks like a reset to 0%
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
                bottomLabel: etaLine,
              },
            ]
          : undefined

  // the contract keeps only when the unwind may start; the request came one
  // withdrawal delay earlier (exact while the delay is unchanged). It tells
  // apart otherwise identical rows, quietly, on the USD line — only where no
  // stat competes for the width: an in-progress row already says when.
  // A partly claimable row has its Claim button where the estimate goes, so
  // the rest's estimate takes the date's place on the USD line.
  const amountMeta =
    status === "claimable" &&
    row.state === "partial" &&
    (eta || row.reserveShort)
      ? t("withdrawals.amountMetaRest", {
          usd,
          rest: row.reserveShort
            ? t("withdrawals.eta.reserve")
            : t("withdrawals.eta.rest", { eta }),
        })
      : vaultStats === undefined || stats !== undefined
        ? usd
        : t("withdrawals.amountMeta", {
            usd,
            requested: new Date(
              row.eligibleAt - vaultStats.withdrawalDelay * 1000,
            ),
          })

  return (
    <>
      <PendingPosition
        assetId={displayAsset.id}
        value={t("common:currency", { value: remaining, symbol })}
        displayValue={amountMeta}
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
                  : // formatted exactly like the amount column beside it
                    t("withdrawals.action.claimAmount", {
                      amount: t("common:currency", {
                        value: row.collateralSettled ?? 0,
                        symbol,
                      }),
                    })}
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

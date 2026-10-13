import {
  Chip,
  type ChipProps,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { type FC, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { PendingPosition } from "@/components/PendingPosition"
import { DateText } from "@/components/RelativeDateText"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import {
  useClaim,
  usePendingClaimIds,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { getWithdrawalStateLabel } from "@/modules/strategies/propeller/utils/withdrawalState"
import { useAssets } from "@/providers/assetsProvider"

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

export const WithdrawalPosition: FC<{ row: PropellerWithdrawalRow }> = ({
  row,
}) => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()
  const { symbol } = getAssetWithFallback(row.vault.assetId)
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
  const status = getWithdrawalStateLabel({ ...row, state })
  const stats =
    state === "cooldown"
      ? [
          {
            label: t("withdrawals.eligibleAt"),
            value: <DateText date={new Date(row.eligibleAt)} />,
          },
        ]
      : state === "pending"
        ? [
            {
              label: t("withdrawals.state.pending"),
              value: t("withdrawals.waitingUnwind"),
            },
          ]
        : status !== "claimable" &&
            row.state === "partial" &&
            (row.collateralOwed ?? 0) > 0
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
      assetId={row.vault.assetId}
      value={t("common:currency", { value: row.estEth, symbol })}
      displayValue={t("common:currency", { value: row.estUsd })}
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
            {t("withdrawals.action.claim")}
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

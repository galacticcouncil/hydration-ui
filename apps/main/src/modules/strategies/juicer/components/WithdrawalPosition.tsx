import {
  Chip,
  type ChipProps,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { type FC, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  PendingPosition,
  type PendingPositionStat,
} from "@/components/PendingPosition"
import { ClaimModal } from "@/modules/strategies/juicer/components/ClaimModal"
import { useVaultDisplayAsset } from "@/modules/strategies/juicer/hooks/useCollateralEquivalent"
import { type JuicerWithdrawalRow } from "@/modules/strategies/juicer/hooks/useJuicerAccount"
import { vaultStatsQuery } from "@/modules/strategies/juicer/hooks/useVaultReads"
import {
  useClaim,
  usePendingClaimIds,
} from "@/modules/strategies/juicer/hooks/useVaultWrites"
import { formatEta } from "@/modules/strategies/juicer/utils/withdrawalEta"
import { getWithdrawalStateLabel } from "@/modules/strategies/juicer/utils/withdrawalState"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const statusVariants: Record<
  ReturnType<typeof getWithdrawalStateLabel>,
  ChipProps["variant"]
> = {
  pending: "orange",
  settling: "amber",
  claimable: "green",
  claimed: "blue",
}

type WithdrawalPositionProps = {
  row: JuicerWithdrawalRow
}

export const WithdrawalPosition: FC<WithdrawalPositionProps> = ({ row }) => {
  const { t } = useTranslation(["juicer", "common"])
  // row amounts arrive already converted to the current display asset
  const displayAsset = useVaultDisplayAsset()(row.vault)
  const { symbol } = displayAsset
  // the whole withdrawal from request to the last claim, so a partial claim
  // never reads as the amount shrinking; the USD line says what was claimed
  const usd = t("common:currency", { value: row.totalUsd })
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
  // a partial claim surfaces in quarters of the request; the rest once repaid
  const status = getWithdrawalStateLabel(row)
  // when the whole withdrawal is claimable: measured keeper pace behind the
  // queue ahead — an estimate, so it is shown coarse and never as a promise
  const eta =
    row.claimableInSeconds !== null ? formatEta(row.claimableInSeconds) : null
  // the row tells the whole withdrawal, what was claimed and what is left:
  // claimed plus left is the whole, however settlement and the quarters a
  // partial claim waits for split what is left
  const left = Math.max((row.collateralOwed ?? 0) - row.claimedEth, 0)
  const leftAmount = t("common:currency", {
    value: left,
    symbol,
    maximumFractionDigits: 4,
  })
  const hasClaimed = row.claimedEth > 0
  const claimedAmount = t("common:currency", {
    value: row.claimedEth,
    symbol,
    maximumFractionDigits: 4,
  })
  const etaStat: PendingPositionStat | null =
    row.reserveShort || eta
      ? {
          label:
            hasClaimed || status === "claimable"
              ? t("withdrawals.eta.allLabel")
              : t("withdrawals.eta.label"),
          value: row.reserveShort ? t("withdrawals.eta.reserveShort") : eta,
          tooltip: row.reserveShort
            ? t("withdrawals.eta.reserveTooltip")
            : undefined,
        }
      : null
  const stats: PendingPositionStat[] = [
    hasClaimed && {
      label: t("withdrawals.stat.claimed"),
      value: claimedAmount,
    },
    hasClaimed &&
      left > 0 && { label: t("withdrawals.stat.left"), value: leftAmount },
    etaStat,
  ].filter((stat): stat is PendingPositionStat => !!stat)
  // the contract keeps only when the unwind may start; the request came one
  // withdrawal delay earlier (exact while the delay is unchanged). It tells
  // apart otherwise identical rows — only where nothing else does.
  if (stats.length === 0 && vaultStats)
    stats.push({
      label: t("withdrawals.stat.date"),
      value: t("withdrawals.requested", {
        requested: new Date(row.eligibleAt - vaultStats.withdrawalDelay * 1000),
      }),
    })

  return (
    <>
      <PendingPosition
        assetId={displayAsset.id}
        value={t("common:currency", { value: row.totalEth, symbol })}
        displayValue={usd}
        stats={stats}
        // side by side, several stats squeeze the amount: give them a row
        forceWrap={stats.length > 1}
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
                  : t("withdrawals.action.claimAmount", {
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

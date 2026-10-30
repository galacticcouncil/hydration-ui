import {
  Chip,
  type ChipProps,
  Flex,
  LoadingButton,
  Text,
  ValueStatsLabel,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { type FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { PendingPosition } from "@/components/PendingPosition"
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
  settling: "amber",
  claimable: "green",
  claimed: "blue",
}

type WithdrawalPositionProps = {
  row: PropellerWithdrawalRow
}

export const WithdrawalPosition: FC<WithdrawalPositionProps> = ({ row }) => {
  const { t } = useTranslation(["propeller", "common"])
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
  // what is still to settle, neither claimed nor claimable yet: named as an
  // amount, so it never reads as the whole withdrawal or the whole position
  const toSettle = Math.max(
    (row.collateralOwed ?? 0) - (row.settledSoFar ?? 0),
    0,
  )
  const moreLine = row.reserveShort
    ? t("withdrawals.eta.reserve")
    : eta && toSettle > 0
      ? t("withdrawals.eta.more", {
          amount: t("common:currency", {
            value: toSettle,
            symbol,
            maximumFractionDigits: 4,
          }),
          eta,
        })
      : undefined
  const stats =
    status === "pending" && (row.reserveShort || eta)
      ? [
          {
            // label above the value at every width: beside the value and
            // the chip, the label leaves a narrow phone no room
            value: (
              <Flex direction="column" align="flex-end">
                <ValueStatsLabel>{t("withdrawals.eta.label")}</ValueStatsLabel>
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
              // two lines, mirroring the amount column: progress of the
              // whole withdrawal, then what is still to come and when. The
              // chip already says Settling. Between quarters a settled part
              // waits for its Claim button, so the progress counts all that
              // settled, claimed or not, and adds up with what is to come
              value: t("withdrawals.settledInline", {
                amount: t("common:currency", {
                  value: row.settledSoFar ?? 0,
                  symbol,
                  maximumFractionDigits: 4,
                }),
                pct: (
                  ((row.settledSoFar ?? 0) / (row.collateralOwed || 1)) *
                  100
                ).toFixed(1),
              }),
              bottomLabel: moreLine,
            },
          ]
        : undefined

  // what already reached the wallet, beside the USD value
  const claimed =
    row.claimedEth > 0
      ? t("withdrawals.claimedSoFar", {
          amount: t("common:currency", {
            value: row.claimedEth,
            symbol,
            maximumFractionDigits: 4,
          }),
        })
      : null
  // a partly claimable row has its Claim button where the estimate goes, so
  // what is still to come gets its own line under the USD one
  const rest =
    status === "claimable" && row.state === "partial"
      ? (moreLine ?? null)
      : null
  // the contract keeps only when the unwind may start; the request came one
  // withdrawal delay earlier (exact while the delay is unchanged). It tells
  // apart otherwise identical rows, quietly, on the USD line — only where
  // nothing else does: an in-progress row already says when.
  const amountMeta =
    claimed || rest || vaultStats === undefined || stats !== undefined
      ? // a narrow phone wraps the line between its parts, never inside one
        [usd, claimed]
          .filter((part): part is string => !!part)
          .map((part) => part.replace(/ /g, "\u00a0"))
          // the dot stays with the part before it
          .join("\u00a0· ")
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
        value={t("common:currency", { value: row.totalEth, symbol })}
        displayValue={rest ? [amountMeta, rest] : amountMeta}
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

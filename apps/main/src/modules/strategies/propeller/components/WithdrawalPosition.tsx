import {
  Chip,
  type ChipProps,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { type FC } from "react"
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

export const WithdrawalPosition: FC<{ row: PropellerWithdrawalRow }> = ({
  row,
}) => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()
  const { symbol } = getAssetWithFallback(row.vault.assetId)
  const claim = useClaim()
  const isClaiming = usePendingClaimIds().includes(row.id)
  const status = getWithdrawalStateLabel(row)
  const stats =
    row.state === "cooldown"
      ? [
          {
            label: t("withdrawals.eligibleAt"),
            value: <DateText date={new Date(row.eligibleAt)} />,
          },
        ]
      : status !== "claimable" &&
          row.state === "partial" &&
          (row.collateralOwed ?? 0) > 0
        ? [
            {
              label: t("withdrawals.state.settling"),
              value: t("withdrawals.settledProgress", {
                settled: t("common:currency", {
                  value: row.settledSoFar ?? 0,
                  symbol,
                }),
                owed: t("common:currency", {
                  value: row.collateralOwed,
                  symbol,
                }),
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

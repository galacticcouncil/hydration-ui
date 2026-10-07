import {
  Amount,
  Flex,
  LoadingButton,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { DateText } from "@/components/RelativeDateText"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { blockTimestampQuery } from "@/modules/strategies/propeller/hooks/useRedemptionHistory"
import {
  useClaim,
  useClaimSurplus,
  usePendingClaimIds,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const getWithdrawalStateLabel = (row: PropellerWithdrawalRow) => {
  if (row.state === "claimed") return "claimed"
  if ((row.collateralSettled ?? 0) > 0) return "claimable"
  if (row.state === "cooldown") return "cooldown"
  if (row.state === "partial") return "settling"
  return "pending"
}

const SettledDate = ({ blockNumber }: { blockNumber: bigint }) => {
  const rpc = useRpcProvider()
  const { data } = useQuery(blockTimestampQuery(rpc, blockNumber))
  return data ? <DateText date={data} /> : <Skeleton height="1em" width={60} />
}

const columnHelper = createColumnHelper<PropellerWithdrawalRow>()

export const useWithdrawalColumns = () => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()
  const claim = useClaim()
  const recovery = useClaimSurplus()
  const claimingIds = usePendingClaimIds()

  return useMemo(() => {
    const amountColumn = columnHelper.accessor("estEth", {
      header: t("common:amount"),
      cell: ({ row: { original: row } }) => {
        const { symbol } = getAssetWithFallback(row.vault.assetId)
        return (
          <Flex align="center" gap="s">
            <AssetLogo id={row.vault.assetId} size="small" />
            {row.isSettlementLoading ? (
              <Skeleton height="1em" width={80} />
            ) : (
              <Text fs="p4" fw={500} color={getToken("text.high")}>
                {t("common:currency", { value: row.estEth, symbol })}
              </Text>
            )}
          </Flex>
        )
      },
    })
    const valueColumn = columnHelper.accessor("estUsd", {
      header: t("withdrawals.col.estValue"),
      cell: ({ row }) => (
        <Amount
          value={t("common:currency", { value: row.original.estUsd })}
          isLoading={row.original.isSettlementLoading}
        />
      ),
    })
    const statusColumn = columnHelper.display({
      id: "status",
      header: t("common:status"),
      cell: ({ row: { original: row } }) => {
        const label = getWithdrawalStateLabel(row)
        const { symbol } = getAssetWithFallback(row.vault.assetId)
        const owed = row.collateralOwed ?? 0
        const color =
          label === "claimable"
            ? getToken("accents.success.primary")
            : label === "claimed"
              ? getToken("text.medium")
              : label === "settling"
                ? getToken("accents.alertAlt.primary")
                : getToken("accents.alert.primary")
        return (
          <Flex direction="column" gap="xs">
            <Text fs="p4" fw={600} color={color}>
              {t(`withdrawals.state.${label}`)}
            </Text>
            {label !== "claimable" && row.state === "partial" && owed > 0 && (
              <Text fs="p6" color={getToken("text.low")}>
                {t("withdrawals.settledProgress", {
                  settled: t("common:currency", {
                    value: row.settledSoFar ?? 0,
                  }),
                  owed: t("common:currency", { value: owed, symbol }),
                })}
              </Text>
            )}
            {row.state === "cooldown" && (
              <Text fs="p6" color={getToken("text.low")}>
                {t("withdrawals.eligibleAt")}{" "}
                <DateText date={new Date(row.eligibleAt)} />
              </Text>
            )}
            {row.settledBlock !== undefined && (
              <Text fs="p6" color={getToken("text.low")}>
                {t("withdrawals.date")}
                {": "}
                <SettledDate blockNumber={row.settledBlock} />
              </Text>
            )}
            {row.sourcePending && row.state === "claimed" && (
              <Text fs="p6" color={getToken("text.low")}>
                {t("withdrawals.recoveryPending")}
              </Text>
            )}
          </Flex>
        )
      },
    })
    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: { sx: { textAlign: "right" } },
      cell: ({ row: { original: row } }) => {
        const { symbol } = getAssetWithFallback(row.vault.assetId)
        const isClaiming = claimingIds.includes(row.id)
        return (
          <Flex justify="flex-end" align="center" gap="base" wrap>
            {getWithdrawalStateLabel(row) === "claimable" && (
              <LoadingButton
                aria-label={`${t("withdrawals.action.claim")} ${symbol}`}
                variant="primary"
                size="small"
                loadingMode="replace"
                onClick={() =>
                  claim.mutate({ vault: row.vault, requestId: row.requestId })
                }
                isLoading={isClaiming}
                disabled={isClaiming}
              >
                {t("withdrawals.action.claim")}
              </LoadingButton>
            )}
            {row.surplusHollar > 0 && (
              <LoadingButton
                variant="secondary"
                size="small"
                isLoading={
                  recovery.isPending &&
                  recovery.variables?.requestId === row.requestId &&
                  recovery.variables?.vault.vaultAddress ===
                    row.vault.vaultAddress
                }
                disabled={recovery.isPending}
                onClick={() =>
                  recovery.mutate({
                    vault: row.vault,
                    requestId: row.requestId,
                    mainDebt: row.mainDebt,
                  })
                }
              >
                {t("withdrawals.action.claimRecovery", {
                  amount: row.surplusHollar,
                })}
              </LoadingButton>
            )}
          </Flex>
        )
      },
    })
    return [amountColumn, valueColumn, statusColumn, actionsColumn]
  }, [t, getAssetWithFallback, claim, recovery, claimingIds])
}

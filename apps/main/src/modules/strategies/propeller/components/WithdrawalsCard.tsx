import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Chip,
  ChipProps,
  Flex,
  LoadingButton,
  Pagination,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { PendingPosition } from "@/components/PendingPosition"
import { DateText } from "@/components/RelativeDateText"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { blockTimestampQuery } from "@/modules/strategies/propeller/hooks/useRedemptionHistory"
import {
  useClaim,
  usePendingClaimIds,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const WITHDRAWALS_PAGE_SIZE = 5

type WithdrawalStateLabel =
  | "pending"
  | "claimable"
  | "settling"
  | "settlingShort"
  | "claimed"

const stateChipVariant: Record<WithdrawalStateLabel, ChipProps["variant"]> = {
  pending: "orange",
  settling: "amber",
  settlingShort: "orange",
  claimable: "green",
  claimed: "blue",
}

const getWithdrawalStateLabel = (
  row: PropellerWithdrawalRow,
): WithdrawalStateLabel => {
  if (row.state === "claimed") return "claimed"

  const claimable = row.collateralSettled ?? 0
  if (claimable > 0) return "claimable"
  if (row.willSettleShort) return "settlingShort"
  if (row.state === "partial") return "settling"
  return "pending"
}

/** Unclaimed first, newest (highest request id) first within each group. */
const sortWithdrawals = (rows: PropellerWithdrawalRow[]) =>
  [...rows].sort(
    (a, b) =>
      Number(a.state === "claimed") - Number(b.state === "claimed") ||
      b.requestId - a.requestId,
  )

const SettledDate = ({ blockNumber }: { blockNumber: bigint }) => {
  const rpc = useRpcProvider()
  const { data } = useQuery(blockTimestampQuery(rpc, blockNumber))

  return data ? <DateText date={data} /> : <Skeleton height="1em" width={60} />
}

interface Props {
  rows: PropellerWithdrawalRow[]
}

export const WithdrawalsCard = ({ rows }: Props) => {
  const { t } = useTranslation(["propeller", "common"])
  const { getAssetWithFallback } = useAssets()
  const claim = useClaim()
  const claimingIds = usePendingClaimIds()
  const [page, setPage] = useState(1)

  const sortedRows = useMemo(() => sortWithdrawals(rows), [rows])

  useEffect(() => {
    setPage(1)
  }, [sortedRows.length])

  if (rows.length === 0) return null

  const totalPages = Math.ceil(sortedRows.length / WITHDRAWALS_PAGE_SIZE)
  const pagedRows = sortedRows.slice(
    (page - 1) * WITHDRAWALS_PAGE_SIZE,
    page * WITHDRAWALS_PAGE_SIZE,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("withdrawals.title")}</CardTitle>
      </CardHeader>
      <CardBody>
        <Stack gap="m">
          {pagedRows.map((row) => {
            const label = getWithdrawalStateLabel(row)
            const { symbol } = getAssetWithFallback(row.vault.assetId)
            const owed = row.collateralOwed ?? 0
            const isClaiming = claimingIds.includes(row.id)

            return (
              <PendingPosition
                key={row.id}
                assetId={row.vault.assetId}
                value={t("common:currency", { value: row.estEth, symbol })}
                displayValue={t("common:currency", { value: row.estUsd })}
                isLoading={row.isSettlementLoading}
                stats={
                  row.settledBlock !== undefined
                    ? [
                        {
                          label: t("withdrawals.date"),
                          value: <SettledDate blockNumber={row.settledBlock} />,
                        },
                      ]
                    : undefined
                }
                status={
                  <Flex direction="column" gap="s" align="flex-end">
                    {label === "claimable" ? (
                      <LoadingButton
                        variant="secondary"
                        size="small"
                        loadingMode="replace"
                        onClick={() =>
                          claim.mutate({
                            vault: row.vault,
                            requestId: row.requestId,
                          })
                        }
                        isLoading={isClaiming}
                        disabled={isClaiming}
                      >
                        {t("withdrawals.action.claim")}
                      </LoadingButton>
                    ) : (
                      <>
                        <Chip variant={stateChipVariant[label]} size="small">
                          {t(`withdrawals.state.${label}`)}
                        </Chip>
                        {row.state === "partial" && owed > 0 && (
                          <Text fs="p6" color={getToken("text.low")}>
                            {t("withdrawals.settledProgress", {
                              settled: t("common:currency", {
                                value: row.settledSoFar ?? 0,
                              }),
                              owed: t("common:currency", {
                                value: owed,
                                symbol,
                              }),
                            })}
                          </Text>
                        )}
                      </>
                    )}
                  </Flex>
                }
              />
            )
          })}

          {totalPages > 1 && (
            <Pagination
              totalPages={totalPages}
              currentPage={page}
              onPageChange={setPage}
            />
          )}
        </Stack>
      </CardBody>
    </Card>
  )
}

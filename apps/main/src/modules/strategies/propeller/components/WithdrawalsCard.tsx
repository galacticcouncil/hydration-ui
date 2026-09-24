import {
  Box,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  DataTable,
  Flex,
  Pagination,
  Stack,
  TableContainer,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { ClaimModal } from "@/modules/strategies/propeller/components/ClaimModal"
import { useWithdrawalColumns } from "@/modules/strategies/propeller/components/Withdrawals.columns"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { usePendingClaimIds } from "@/modules/strategies/propeller/hooks/useVaultWrites"

const WITHDRAWALS_PAGE_SIZE = 5

interface Props {
  rows: PropellerWithdrawalRow[]
}

const defaultShowRedeemed = (rows: PropellerWithdrawalRow[]) => {
  const hasClaimable = rows.some(
    (row) => row.state !== "claimed" && (row.collateralSettled ?? 0) > 0,
  )
  const hasClaimed = rows.some((row) => row.state === "claimed")
  return !hasClaimable && hasClaimed
}

export const WithdrawalsCard = ({ rows }: Props) => {
  const { t } = useTranslation("propeller")
  const { isMobile, isTablet } = useBreakpoints()
  const [showRedeemedOverride, setShowRedeemedOverride] = useState<
    boolean | null
  >(null)
  const showRedeemed = showRedeemedOverride ?? defaultShowRedeemed(rows)

  const [claimRow, setClaimRow] = useState<PropellerWithdrawalRow | null>(null)
  const claimingIds = usePendingClaimIds()

  const visibleRows = showRedeemed
    ? rows
    : rows.filter((row) => row.state !== "claimed")

  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [visibleRows.length, showRedeemed])

  const totalPages = Math.ceil(visibleRows.length / WITHDRAWALS_PAGE_SIZE)

  const pagination = useMemo(
    () => ({
      pageIndex: page - 1,
      pageSize: WITHDRAWALS_PAGE_SIZE,
    }),
    [page],
  )

  const pagedRows = useMemo(() => {
    const start = (page - 1) * WITHDRAWALS_PAGE_SIZE
    return visibleRows.slice(start, start + WITHDRAWALS_PAGE_SIZE)
  }, [visibleRows, page])

  const onClaim = useCallback((row: PropellerWithdrawalRow) => {
    setClaimRow(row)
  }, [])
  const columns = useWithdrawalColumns({ onClaim, claimingIds })

  if (rows.length === 0) return null

  return (
    <>
      <Card>
        <CardHeader>
          <Flex justify="space-between" align="center" wrap gap="m">
            <CardTitle>{t("withdrawals.title")}</CardTitle>
            <Flex align="center" gap="base">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("withdrawals.showRedeemed")}
              </Text>
              <Toggle
                size="medium"
                checked={showRedeemed}
                onCheckedChange={setShowRedeemedOverride}
                name="show-redeemed"
              />
            </Flex>
          </Flex>
        </CardHeader>
        {visibleRows.length === 0 ? (
          <CardBody>
            <Text fs="p4" color={getToken("text.low")}>
              {showRedeemed
                ? t("withdrawals.empty.all")
                : t("withdrawals.empty.pending")}
            </Text>
          </CardBody>
        ) : isMobile || isTablet ? (
          <Box px="m" pb="m">
            <Stack gap="m">
              <StackedTable data={pagedRows} columns={columns} />
              {totalPages > 1 && (
                <Pagination
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                />
              )}
            </Stack>
          </Box>
        ) : (
          <TableContainer borderRadius="xl">
            <DataTable
              data={visibleRows}
              columns={columns}
              size="small"
              paginated
              pagination={pagination}
              onPageClick={setPage}
            />
          </TableContainer>
        )}
      </Card>
      <ClaimModal row={claimRow} onClose={() => setClaimRow(null)} />
    </>
  )
}

import {
  Box,
  Card,
  CardHeader,
  CardTable,
  CardTitle,
  DataTable,
  Pagination,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { useWithdrawalColumns } from "@/modules/strategies/propeller/components/Withdrawals.columns"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"

const WITHDRAWALS_PAGE_SIZE = 5

/** Unclaimed first, newest (highest request id) first within each group. */
const sortWithdrawals = (rows: PropellerWithdrawalRow[]) =>
  [...rows].sort(
    (a, b) =>
      Number(a.state === "claimed") - Number(b.state === "claimed") ||
      b.requestId - a.requestId,
  )

interface Props {
  rows: PropellerWithdrawalRow[]
}

export const WithdrawalsCard = ({ rows }: Props) => {
  const { t } = useTranslation("propeller")
  const { gte } = useBreakpoints()
  const [page, setPage] = useState(1)
  const columns = useWithdrawalColumns()
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
      {gte("xl") ? (
        <TableContainer borderRadius="xl">
          <DataTable data={pagedRows} columns={columns} />
        </TableContainer>
      ) : (
        <Box p="m">
          <CardTable data={pagedRows} columns={columns} />
        </Box>
      )}
      {totalPages > 1 && (
        <Box p="m">
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            onPageChange={setPage}
          />
        </Box>
      )}
    </Card>
  )
}

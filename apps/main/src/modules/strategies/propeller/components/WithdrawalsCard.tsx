import {
  Card,
  CardHeader,
  CardTitle,
  Pagination,
  Stack,
} from "@galacticcouncil/ui/components"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { WithdrawalPosition } from "@/modules/strategies/propeller/components/WithdrawalPosition"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { getWithdrawalStateLabel } from "@/modules/strategies/propeller/utils/withdrawalState"

const WITHDRAWALS_PAGE_SIZE = 5

/** Claimable first, then unclaimed; newest first within each group. */
const sortWithdrawals = (rows: PropellerWithdrawalRow[]) =>
  [...rows].sort(
    (a, b) =>
      Number(getWithdrawalStateLabel(b) === "claimable") -
        Number(getWithdrawalStateLabel(a) === "claimable") ||
      Number(a.state === "claimed") - Number(b.state === "claimed") ||
      b.requestId - a.requestId,
  )

interface Props {
  rows: PropellerWithdrawalRow[]
}

export const WithdrawalsCard = ({ rows }: Props) => {
  const { t } = useTranslation("propeller")
  const [page, setPage] = useState(1)
  const sortedRows = useMemo(() => sortWithdrawals(rows), [rows])

  if (rows.length === 0) return null

  const totalPages = Math.ceil(sortedRows.length / WITHDRAWALS_PAGE_SIZE)
  const currentPage = Math.min(page, totalPages)
  const pagedRows = sortedRows.slice(
    (currentPage - 1) * WITHDRAWALS_PAGE_SIZE,
    currentPage * WITHDRAWALS_PAGE_SIZE,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("withdrawals.title")}</CardTitle>
      </CardHeader>
      <Stack gap="m" p="l">
        {pagedRows.map((row) => (
          <WithdrawalPosition key={row.id} row={row} />
        ))}
        {totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={setPage}
          />
        )}
      </Stack>
    </Card>
  )
}

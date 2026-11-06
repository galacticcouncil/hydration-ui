import {
  Card,
  CardHeader,
  CardTitle,
  Pagination,
  Stack,
} from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { WithdrawalPosition } from "@/modules/strategies/propeller/components/WithdrawalPosition"
import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { getWithdrawalStateLabel } from "@/modules/strategies/propeller/utils/withdrawalState"

const WITHDRAWALS_PAGE_SIZE = 5
const WITHDRAWALS_SECTION_ID = "withdrawals"

/** Claimable first, then unclaimed; newest first within each group. */
const sortWithdrawals = (rows: PropellerWithdrawalRow[]) =>
  [...rows].sort(
    (a, b) =>
      Number(getWithdrawalStateLabel(b) === "claimable") -
        Number(getWithdrawalStateLabel(a) === "claimable") ||
      Number(a.state === "claimed") - Number(b.state === "claimed") ||
      // request ids count per vault: order by time across vaults
      b.eligibleAt - a.eligibleAt ||
      b.requestId - a.requestId,
  )

interface Props {
  rows: PropellerWithdrawalRow[]
}

export const WithdrawalsCard = ({ rows }: Props) => {
  const { t } = useTranslation("propeller")
  const [page, setPage] = useState(1)
  const sortedRows = useMemo(() => sortWithdrawals(rows), [rows])
  // a new request sorts behind claimable rows: jump back to the first page so
  // it is never created out of sight
  // (ids count per vault, so the newest is the latest request time)
  const newest = rows.reduce((max, row) => Math.max(max, row.eligibleAt), -1)
  const seenNewest = useRef(newest)
  useEffect(() => {
    if (newest > seenNewest.current) setPage(1)
    seenNewest.current = newest
  }, [newest])

  // a portfolio Claim lands here: on a phone the card sits far below the
  // fold, so bring it into view once, when its rows have loaded
  const { section } = useSearch({ from: "/strategies/juicer/" })
  const scrolled = useRef(false)
  const hasRows = rows.length > 0
  useEffect(() => {
    if (section !== "withdrawals" || !hasRows || scrolled.current) return
    scrolled.current = true
    document
      .getElementById(WITHDRAWALS_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [section, hasRows])

  if (rows.length === 0) return null

  const totalPages = Math.ceil(sortedRows.length / WITHDRAWALS_PAGE_SIZE)
  const currentPage = Math.min(page, totalPages)
  const pagedRows = sortedRows.slice(
    (currentPage - 1) * WITHDRAWALS_PAGE_SIZE,
    currentPage * WITHDRAWALS_PAGE_SIZE,
  )

  return (
    <Card
      id={WITHDRAWALS_SECTION_ID}
      // clear the sticky header when scrolled to
      sx={{ scrollMarginTop: "calc(3.375rem + 1rem)" }}
    >
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

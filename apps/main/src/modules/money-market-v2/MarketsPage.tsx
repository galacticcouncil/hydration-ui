import {
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import { ChevronRight, Search } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
  DataTable,
  Icon,
  Input,
  Paper,
  SectionHeader,
  Stack,
  TableContainer,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { useNavigateToReserve } from "@/modules/money-market-v2/hooks"
import {
  NoData,
  ReadError,
  ReserveApyCell,
  ReserveAsset,
} from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { isHollar } from "@/modules/money-market-v2/reserves"
import { useResolveReserveDisplay } from "@/modules/money-market-v2/useReserveDisplay"
import { numericallyStr, sortBy } from "@/utils/sort"

const right = { meta: { sx: { textAlign: "right" } } } as const

const { accessor, display } = createColumnHelper<ReserveSummary>()

/**
 * Every reserve of the selected market, laid out like /borrow/markets. The
 * header totals use v1's formula (available = size - borrows) so the two
 * pages can be compared number for number.
 */
export const MarketsPage: FC = () => {
  const { t } = useTranslation()
  const { market } = useMoneyMarket()
  const reserves = useReserveSummaries()
  const navigateToReserve = useNavigateToReserve()
  const resolveDisplay = useResolveReserveDisplay()
  const sorting = useDataTableUrlSorting("/money-market/markets/", "sort")
  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/money-market/markets/",
    "search",
  )

  const stats = useMemo(() => {
    if (!reserves.data) return null
    const size = reserves.data.reduce(
      (sum, r) => sum.plus(r.totalLiquidityUsd),
      Big(0),
    )
    const borrows = reserves.data.reduce(
      (sum, r) => sum.plus(r.totalDebtUsd),
      Big(0),
    )
    return {
      size: size.toFixed(),
      available: size.minus(borrows).toFixed(),
      borrows: borrows.toFixed(),
    }
  }, [reserves.data])

  const columns = useMemo(
    () => [
      // sorted and searched by the name the row shows
      accessor((reserve) => resolveDisplay(reserve).symbol, {
        id: "symbol",
        header: "Asset",
        cell: ({ row }) => <ReserveAsset reserve={row.original} />,
      }),
      accessor("totalLiquidityUsd", {
        header: "Total supplied",
        ...right,
        sortingFn: sortBy({
          select: (row) => row.original.totalLiquidityUsd,
          compare: numericallyStr,
        }),
        cell: ({ row }) => {
          const { underlyingAsset, totalLiquidity, totalLiquidityUsd } =
            row.original
          if (isHollar(underlyingAsset, market)) return <NoData />

          return (
            <Amount
              value={t("number.compact", { value: totalLiquidity })}
              displayValue={t("currency.compact", { value: totalLiquidityUsd })}
            />
          )
        },
      }),
      display({
        id: "supplyApy",
        header: "Supply APY",
        ...right,
        cell: ({ row }) => (
          <ReserveApyCell reserve={row.original} side="supply" />
        ),
      }),
      accessor("totalDebtUsd", {
        header: "Total borrowed",
        ...right,
        sortingFn: sortBy({
          select: (row) => row.original.totalDebtUsd,
          compare: numericallyStr,
        }),
        cell: ({ row }) => {
          const { borrowingEnabled, totalDebt, totalDebtUsd } = row.original
          if (!borrowingEnabled || Big(totalDebt).eq(0)) return <NoData />

          return (
            <Amount
              value={t("number.compact", { value: totalDebt })}
              displayValue={t("currency.compact", { value: totalDebtUsd })}
            />
          )
        },
      }),
      display({
        id: "variableBorrowApy",
        header: "Borrow APY",
        ...right,
        cell: ({ row }) => (
          <ReserveApyCell reserve={row.original} side="borrow" />
        ),
      }),
      display({
        id: "actions",
        ...right,
        cell: () => (
          <Icon
            display="inline-flex"
            component={ChevronRight}
            color={getToken("icons.onContainer")}
            size="m"
          />
        ),
      }),
    ],
    [t, market, resolveDisplay],
  )

  const usd = (value: string | undefined) =>
    value ? t("currency.compact", { value }) : "—"

  return (
    <Stack gap="xxl">
      <Stack
        direction={["column", null, "row"]}
        justify="flex-start"
        gap={["base", null, "xxxl"]}
        separated
      >
        <ValueStats
          size="large"
          isLoading={reserves.isPending}
          label="Total market size"
          wrap
          value={usd(stats?.size)}
        />
        <ValueStats
          size="large"
          isLoading={reserves.isPending}
          label="Total available"
          wrap
          value={usd(stats?.available)}
        />
        <ValueStats
          size="large"
          isLoading={reserves.isPending}
          label="Total borrows"
          wrap
          value={usd(stats?.borrows)}
        />
      </Stack>

      <Box>
        <SectionHeader
          as="h1"
          title="All markets"
          actions={
            <Input
              value={searchPhrase}
              placeholder={t("search.placeholder.assets")}
              iconStart={Search}
              width={["100%", null, "4xl"]}
              onChange={(e) => setSearchPhrase(e.target.value)}
            />
          }
          sx={{
            flexDirection: ["column-reverse", "row"],
            gap: ["xl", 0],
            alignItems: ["flex-start", "center"],
          }}
        />
        {reserves.error ? (
          <ReadError error={reserves.error} />
        ) : (
          <TableContainer as={Paper}>
            <DataTable
              globalFilter={searchPhrase}
              isLoading={reserves.isPending}
              onRowClick={(row) => navigateToReserve(row.underlyingAsset)}
              data={reserves.data ?? []}
              columns={columns}
              {...sorting}
            />
          </TableContainer>
        )}
      </Box>
    </Stack>
  )
}

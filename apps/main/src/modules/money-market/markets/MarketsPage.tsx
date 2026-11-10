import { isHiddenReserve } from "@galacticcouncil/money-market/core"
import {
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market/react"
import type { ReserveSummary } from "@galacticcouncil/money-market/types"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Box,
  DataTable,
  Icon,
  Paper,
  ScrollArea,
  Stack,
  TableContainer,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import Big from "big.js"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TitleWithSearch } from "@/components/TitleWithSearch"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { useResolveReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import { useNavigateToReserve } from "@/modules/money-market/hooks"
import { isHollar } from "@/modules/money-market/reserves/reserves"
import { useResolveReserveDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import {
  NoData,
  ReserveApyCell,
  ReserveAsset,
} from "@/modules/money-market/table/cells"
import { ReadError } from "@/modules/money-market/table/ReserveTable"
import { numericallyStr, sortBy } from "@/utils/sort"

const right = { meta: { sx: { textAlign: "right" } } } as const

const { accessor, display } = createColumnHelper<ReserveSummary>()

/**
 * Every reserve of the selected market, laid out like /borrow/markets. The
 * header totals use v1's formula (available = size - borrows) so the two
 * pages can be compared number for number.
 */
export const MarketsPage: FC = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { market } = useMoneyMarket()
  const reserves = useReserveSummaries()
  const navigateToReserve = useNavigateToReserve()
  const resolveDisplay = useResolveReserveDisplay()
  const resolveApy = useResolveReserveApy()
  const sorting = useDataTableUrlSorting("/borrow/markets/", "sort")
  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/borrow/markets/",
    "search",
  )

  const stats = useMemo(() => {
    if (!reserves.data) return null
    const listed = reserves.data.filter(
      (r) => !isHiddenReserve(r.underlyingAsset),
    )
    const size = listed.reduce(
      (sum, r) => sum.plus(r.totalLiquidityUsd),
      Big(0),
    )
    const borrows = listed.reduce((sum, r) => sum.plus(r.totalDebtUsd), Big(0))
    return {
      size: size.toFixed(),
      available: size.minus(borrows).toFixed(),
      borrows: borrows.toFixed(),
    }
  }, [reserves.data])

  // v1's list: only reserves open for use, Hollar first, then largest supply
  const rows = useMemo(
    () =>
      (reserves.data ?? [])
        .filter(
          (r) =>
            r.isActive &&
            !r.isFrozen &&
            !r.isPaused &&
            !isHiddenReserve(r.underlyingAsset),
        )
        .sort((a, b) => {
          const aHollar = isHollar(a.underlyingAsset, market)
          const bHollar = isHollar(b.underlyingAsset, market)
          if (aHollar !== bHollar) return aHollar ? -1 : 1
          return Big(b.totalLiquidityUsd).cmp(a.totalLiquidityUsd)
        }),
    [reserves.data, market],
  )

  const columns = useMemo(() => {
    // An unknown rate sorts as -1, below every real one
    const apyOf = (reserve: ReserveSummary, side: "supply" | "borrow") => {
      const rate = resolveApy(reserve)[side]
      return rate?.status === "known" ? rate.total : "-1"
    }

    return [
      // sorted and searched by the name the row shows
      accessor((reserve) => resolveDisplay(reserve).symbol, {
        id: "symbol",
        header: t("asset"),
        cell: ({ row }) => <ReserveAsset reserve={row.original} />,
      }),
      accessor("totalLiquidityUsd", {
        header: t("borrow:totalSupplied"),
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
      accessor((reserve) => apyOf(reserve, "supply"), {
        id: "supplyApy",
        header: t("borrow:summary.supplyApy"),
        ...right,
        sortingFn: sortBy({
          select: (row) => apyOf(row.original, "supply"),
          compare: numericallyStr,
        }),
        // Hollar can't be supplied, so like v1 it has no supply rate
        cell: ({ row }) =>
          isHollar(row.original.underlyingAsset, market) ? (
            <NoData />
          ) : (
            <ReserveApyCell reserve={row.original} side="supply" />
          ),
      }),
      accessor("totalDebtUsd", {
        header: t("totalBorrowed"),
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
      accessor((reserve) => apyOf(reserve, "borrow"), {
        id: "variableBorrowApy",
        header: t("borrow:summary.borrowApy"),
        ...right,
        sortingFn: sortBy({
          select: (row) => apyOf(row.original, "borrow"),
          compare: numericallyStr,
        }),
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
    ]
  }, [t, market, resolveDisplay, resolveApy])

  const usd = (value: string | undefined) =>
    value ? t("currency.compact", { value }) : "—"

  return (
    <>
      <ScrollArea
        orientation="horizontal"
        horizontalEdgeOffset="var(--layout-gutter)"
        hideScrollbar
      >
        <Stack
          direction="row"
          justify="flex-start"
          gap={["xl", null, "xxxl", "3.75rem"]}
          separated
          sx={{ "& > *": { flexShrink: 0 } }}
        >
          <ValueStats
            size="large"
            fixedSize
            isLoading={reserves.isPending}
            label={t("borrow:markets.totalMarketSize")}
            wrap
            value={usd(stats?.size)}
          />
          <ValueStats
            size="large"
            fixedSize
            isLoading={reserves.isPending}
            label={t("borrow:markets.totalAvailable")}
            wrap
            value={usd(stats?.available)}
          />
          <ValueStats
            size="large"
            fixedSize
            isLoading={reserves.isPending}
            label={t("borrow:markets.totalBorrows")}
            wrap
            value={usd(stats?.borrows)}
          />
        </Stack>
      </ScrollArea>

      <Box>
        <TitleWithSearch
          as="h1"
          title={t("borrow:markets.title")}
          value={searchPhrase}
          placeholder={t("search.placeholder.assets")}
          onChange={(e) => setSearchPhrase(e.target.value)}
        />
        {reserves.error ? (
          <ReadError error={reserves.error} />
        ) : (
          <TableContainer as={Paper}>
            <DataTable
              globalFilter={searchPhrase}
              isLoading={reserves.isPending}
              onRowClick={(row) => navigateToReserve(row.underlyingAsset)}
              data={rows}
              columns={columns}
              {...sorting}
            />
          </TableContainer>
        )}
      </Box>
    </>
  )
}

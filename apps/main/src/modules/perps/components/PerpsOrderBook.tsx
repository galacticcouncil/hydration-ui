import {
  Box,
  Flex,
  Skeleton,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  PERPS_BODY_HEIGHT,
  PerpsPanel,
} from "@/modules/perps/components/PerpsPanel"
import { BookLevel, useOrderBook } from "@/modules/perps/PerpsPage.book"

/** Hyperliquid sends 20 levels a side; more than this makes the page unusable. */
const VISIBLE_LEVELS = 11

const COLUMNS = "1.1fr 1fr 1fr"

/** Digits are only comparable down a column when every row has the same scale. */
const decimalsOf = (value: string) => (value.split(".")[1] ?? "").length

const pad = (value: string, decimals: number) => Number(value).toFixed(decimals)

type Row = BookLevel & { total: number }

type RowProps = {
  row: Row
  maxTotal: number
  priceDecimals: number
  sizeDecimals: number
  isBid: boolean
  onClick: () => void
}

const BookRow: FC<RowProps> = ({
  row,
  maxTotal,
  priceDecimals,
  sizeDecimals,
  isBid,
  onClick,
}) => (
  <Box
    as="button"
    onClick={onClick}
    sx={{
      position: "relative",
      display: "block",
      width: "100%",
      padding: 0,
      background: "none",
      border: "none",
      cursor: "pointer",
      ":hover": { background: "rgba(255,255,255,0.05)" },
    }}
  >
    {/* Depth is cumulative, so the bar reads as book pressure rather than noise. */}
    <Box
      sx={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        width: `${Math.min((row.total / maxTotal) * 100, 100)}%`,
        background: isBid ? "rgba(0,190,120,0.16)" : "rgba(235,90,90,0.16)",
      }}
    />
    <Box
      sx={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: COLUMNS,
        gap: 8,
        padding: "3px 12px",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <Text
        fs="p6"
        font="mono"
        color={isBid ? "green400" : "red400"}
        align="left"
      >
        {pad(row.px, priceDecimals)}
      </Text>
      <Text fs="p6" font="mono" align="right">
        {pad(row.sz, sizeDecimals)}
      </Text>
      <Text fs="p6" font="mono" align="right" sx={{ opacity: 0.65 }}>
        {row.total.toFixed(sizeDecimals)}
      </Text>
    </Box>
  </Box>
)

type Props = {
  coin: string
  onPriceSelect: (price: string) => void
}

export const PerpsOrderBook: FC<Props> = ({ coin, onPriceSelect }) => {
  const { t } = useTranslation("trade")
  const book = useOrderBook(coin)

  const view = useMemo(() => {
    if (!book) return null

    const bids = book.bids.slice(0, VISIBLE_LEVELS)
    const asks = book.asks.slice(0, VISIBLE_LEVELS)

    const withTotals = (levels: BookLevel[]): Row[] => {
      let running = 0

      return levels.map((level) => {
        running += Number(level.sz)
        return { ...level, total: running }
      })
    }

    const all = [...bids, ...asks]

    return {
      bids: withTotals(bids),
      asks: withTotals(asks),
      priceDecimals: Math.max(...all.map((l) => decimalsOf(l.px)), 0),
      sizeDecimals: Math.max(...all.map((l) => decimalsOf(l.sz)), 0),
      bestBid: Number(bids[0]?.px ?? 0),
      bestAsk: Number(asks[0]?.px ?? 0),
    }
  }, [book])

  if (!view) return <Skeleton height={PERPS_BODY_HEIGHT} />

  const maxTotal = Math.max(
    view.bids.at(-1)?.total ?? 0,
    view.asks.at(-1)?.total ?? 0,
    1,
  )

  const spread = view.bestAsk - view.bestBid
  const mid = (view.bestAsk + view.bestBid) / 2
  const spreadPct = mid ? (spread / mid) * 100 : 0

  return (
    <PerpsPanel title={t("perps.book.title")}>
      <Stack
        gap="s"
        sx={{
          // Matches the chart so the two columns end on the same line.
          height: PERPS_BODY_HEIGHT,
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: COLUMNS,
            gap: 8,
            padding: "0 12px",
            opacity: 0.6,
          }}
        >
          <Text fs="p6">{t("perps.book.price")}</Text>
          <Text fs="p6" align="right">
            {t("perps.book.size")}
          </Text>
          <Text fs="p6" align="right">
            {t("perps.book.total")}
          </Text>
        </Box>

        <Stack gap="0">
          {[...view.asks].reverse().map((row) => (
            <BookRow
              key={`ask-${row.px}`}
              row={row}
              maxTotal={maxTotal}
              priceDecimals={view.priceDecimals}
              sizeDecimals={view.sizeDecimals}
              isBid={false}
              onClick={() => onPriceSelect(row.px)}
            />
          ))}
        </Stack>

        <Flex
          justify="space-between"
          align="center"
          px="m"
          py="xs"
          sx={{ fontVariantNumeric: "tabular-nums" }}
        >
          <Text fs="p4" font="mono" fw={700}>
            {mid.toFixed(view.priceDecimals)}
          </Text>
          <Text fs="p6" font="mono" sx={{ opacity: 0.65 }}>
            {t("perps.book.spread", {
              spread: spread.toFixed(view.priceDecimals),
              percent: spreadPct.toFixed(3),
            })}
          </Text>
        </Flex>

        <Stack gap="0">
          {view.bids.map((row) => (
            <BookRow
              key={`bid-${row.px}`}
              row={row}
              maxTotal={maxTotal}
              priceDecimals={view.priceDecimals}
              sizeDecimals={view.sizeDecimals}
              isBid
              onClick={() => onPriceSelect(row.px)}
            />
          ))}
        </Stack>
      </Stack>
    </PerpsPanel>
  )
}

import {
  Box,
  Chip,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  MarketType,
  PerpsMarket,
  useAllMarkets,
} from "@/modules/perps/PerpsPage.data"

type Tab = MarketType | "all"

const TABS: Tab[] = ["all", "perp", "spot"]

const compactUsd = (value: string) => {
  const n = Number(value)

  if (!n) return "--"
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`

  return `$${n.toFixed(0)}`
}

const COLUMNS = "2fr 1fr 1.4fr 1fr 1.2fr 1.2fr"

const MarketRow: FC<{ market: PerpsMarket; onSelect: () => void }> = ({
  market,
  onSelect,
}) => {
  const mark = Number(market.markPx)
  const prev = Number(market.prevDayPx)
  const change = prev ? ((mark - prev) / prev) * 100 : 0
  const changeAbs = mark - prev
  const isSpot = market.type === "spot"
  // Hyperliquid quotes funding hourly but displays the 8h rate.
  const funding = Number(market.funding) * 8 * 100

  return (
    <Box
      as="button"
      onClick={onSelect}
      sx={{
        display: "grid",
        gridTemplateColumns: COLUMNS,
        alignItems: "center",
        gap: 8,
        width: "100%",
        padding: "8px 12px",
        cursor: "pointer",
        background: "none",
        border: "none",
        borderRadius: 8,
        textAlign: "left",
        ":hover": { background: "rgba(255,255,255,0.06)" },
      }}
    >
      <Flex gap="s" align="center">
        <Text fs="p5">{market.symbol}</Text>
        <Chip size="small">{isSpot ? "SPOT" : `${market.maxLeverage}x`}</Chip>
      </Flex>
      <Text fs="p6" font="mono">
        {market.markPx || "--"}
      </Text>
      <Text fs="p6" font="mono" color={change >= 0 ? "green400" : "red400"}>
        {prev
          ? `${change >= 0 ? "+" : ""}${changeAbs.toFixed(2)} / ${change.toFixed(2)}%`
          : "--"}
      </Text>
      <Text fs="p6" font="mono">
        {isSpot ? "--" : `${funding.toFixed(4)}%`}
      </Text>
      <Text fs="p6" font="mono">
        {compactUsd(market.dayNtlVlm)}
      </Text>
      <Text fs="p6" font="mono">
        {isSpot ? "--" : compactUsd(String(Number(market.openInterest) * mark))}
      </Text>
    </Box>
  )
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (market: PerpsMarket) => void
}

export const PerpsMarketSelect: FC<Props> = ({
  open,
  onOpenChange,
  onSelect,
}) => {
  const { t } = useTranslation("trade")
  const [tab, setTab] = useState<Tab>("all")
  const [search, setSearch] = useState("")
  const { markets } = useAllMarkets()

  const filtered = useMemo(() => {
    const phrase = search.trim().toLowerCase()

    return markets.filter(
      (market) =>
        (tab === "all" || market.type === tab) &&
        (!phrase || market.symbol.toLowerCase().includes(phrase)),
    )
  }, [markets, tab, search])

  return (
    <Modal variant="popup" open={open} onOpenChange={onOpenChange}>
      <ModalHeader title={t("perps.select.title")} />
      <ModalBody>
        <Input
          value={search}
          placeholder={t("perps.select.search")}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Flex gap="l" mt="m" mb="m">
          {TABS.map((option) => (
            <Text
              key={option}
              as="button"
              fs="p5"
              fw={option === tab ? 600 : 400}
              onClick={() => setTab(option)}
              sx={{ cursor: "pointer", background: "none", border: "none" }}
            >
              {t(`perps.select.tab.${option}`)}
            </Text>
          ))}
        </Flex>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: COLUMNS,
            gap: 8,
            padding: "0 12px 8px",
          }}
        >
          <Text fs="p6">{t("perps.select.col.market")}</Text>
          <Text fs="p6">{t("perps.select.col.price")}</Text>
          <Text fs="p6">{t("perps.select.col.change")}</Text>
          <Text fs="p6">{t("perps.select.col.funding")}</Text>
          <Text fs="p6">{t("perps.select.col.volume")}</Text>
          <Text fs="p6">{t("perps.select.col.openInterest")}</Text>
        </Box>

        <Box sx={{ maxHeight: 420, overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <Text fs="p6">{t("perps.select.empty")}</Text>
          ) : (
            filtered.map((market) => (
              <MarketRow
                key={`${market.type}-${market.symbol}`}
                market={market}
                onSelect={() => {
                  onSelect(market)
                  onOpenChange(false)
                }}
              />
            ))
          )}
        </Box>
      </ModalBody>
    </Modal>
  )
}

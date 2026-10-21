import { Box, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { FC, ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"

import { PerpsDeposit } from "@/modules/perps/components/PerpsDeposit"
import { PerpsPanel } from "@/modules/perps/components/PerpsPanel"
import {
  useAllMarkets,
  useOpenOrders,
  usePerpsAccount,
  useSpotBalances,
} from "@/modules/perps/PerpsPage.data"
import { useCancelOrder, usePlaceOrder } from "@/modules/perps/PerpsPage.orders"

type Tab = "balances" | "positions" | "orders"

const usd = (value: number) =>
  `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`

const Row: FC<{ columns: string; children: ReactNode; isHeader?: boolean }> = ({
  columns,
  children,
  isHeader,
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: columns,
      gap: 12,
      alignItems: "center",
      padding: "6px 4px",
      borderBottom: isHeader ? "1px solid rgba(255,255,255,0.07)" : "none",
      opacity: isHeader ? 0.55 : 1,
      ":hover": isHeader ? undefined : { background: "rgba(255,255,255,0.03)" },
    }}
  >
    {children}
  </Box>
)

const Cell: FC<{
  children: ReactNode
  align?: "left" | "right"
  color?: string
  mono?: boolean
}> = ({ children, align = "right", color, mono = true }) => (
  <Text
    fs="p6"
    font={mono ? "mono" : undefined}
    align={align}
    color={color}
    truncate
  >
    {children}
  </Text>
)

const Empty: FC<{ children: string }> = ({ children }) => (
  <Text fs="p6" sx={{ opacity: 0.6, padding: "8px 4px" }}>
    {children}
  </Text>
)

const BALANCE_COLS = "1.4fr 1fr 1fr 1fr"
const POSITION_COLS = "1.2fr 1fr 1fr 1fr 1.2fr 0.8fr"
const ORDER_COLS = "1.2fr 0.8fr 1fr 1fr 0.8fr"

export const PerpsBottomPanel: FC = () => {
  const { t } = useTranslation("trade")
  const [tab, setTab] = useState<Tab>("balances")
  const [isDepositOpen, setIsDepositOpen] = useState(false)

  const { data: account } = usePerpsAccount()
  const { balances } = useSpotBalances()
  const { data: orders } = useOpenOrders()
  const { markets } = useAllMarkets()

  const cancelOrder = useCancelOrder()
  const placeOrder = usePlaceOrder()

  const positions = account?.assetPositions ?? []
  const perpsUsd = Number(account?.marginSummary.accountValue ?? 0)

  /** Spot assets are priced off their USDC pair; USDC is worth its own total. */
  const usdValueOf = (coin: string, total: number) => {
    if (coin === "USDC") return total

    const mark = markets.find((m) => m.symbol === `${coin}/USDC`)?.markPx

    return mark ? total * Number(mark) : 0
  }

  /**
   * Closing is a market order, so it has to be priced off the current mark.
   * Priced off the entry it would sit on the wrong side of the book whenever
   * the position is under water and cancel unfilled.
   */
  const closePrice = (coin: string, entryPx: string) =>
    markets.find((m) => m.symbol === coin)?.markPx ?? entryPx

  const tabs: { key: Tab; count: number }[] = [
    { key: "balances", count: balances.length + (perpsUsd > 0 ? 1 : 0) },
    { key: "positions", count: positions.length },
    { key: "orders", count: orders?.length ?? 0 },
  ]

  return (
    <PerpsPanel
      action={
        <Flex gap="l" align="center" sx={{ width: "100%" }}>
          {tabs.map(({ key, count }) => (
            <Text
              key={key}
              as="button"
              fs="p6"
              fw={key === tab ? 600 : 400}
              transform="uppercase"
              onClick={() => setTab(key)}
              sx={{
                cursor: "pointer",
                background: "none",
                border: "none",
                padding: 0,
                letterSpacing: "0.06em",
                opacity: key === tab ? 1 : 0.5,
                borderBottom:
                  key === tab
                    ? "1px solid currentColor"
                    : "1px solid transparent",
              }}
            >
              {`${t(`perps.tabs.${key}`)} (${count})`}
            </Text>
          ))}

          <Button
            size="small"
            variant="muted"
            sx={{ marginLeft: "auto", borderRadius: 4 }}
            onClick={() => setIsDepositOpen(true)}
          >
            {t("perps.deposit.title")}
          </Button>
        </Flex>
      }
    >
      {tab === "balances" && (
        <>
          <Row columns={BALANCE_COLS} isHeader>
            <Cell align="left" mono={false}>
              {t("perps.col.asset")}
            </Cell>
            <Cell mono={false}>{t("perps.col.total")}</Cell>
            <Cell mono={false}>{t("perps.col.available")}</Cell>
            <Cell mono={false}>{t("perps.col.value")}</Cell>
          </Row>

          {perpsUsd > 0 && (
            <Row columns={BALANCE_COLS}>
              <Cell align="left">{t("perps.col.usdcPerps")}</Cell>
              <Cell>{account?.marginSummary.accountValue}</Cell>
              <Cell>{account?.withdrawable}</Cell>
              <Cell>{usd(perpsUsd)}</Cell>
            </Row>
          )}

          {balances.map((balance) => {
            const total = Number(balance.total)
            const available = total - Number(balance.hold)

            return (
              <Row key={balance.coin} columns={BALANCE_COLS}>
                <Cell align="left">{balance.coin}</Cell>
                <Cell>{balance.total}</Cell>
                <Cell>{available}</Cell>
                <Cell>{usd(usdValueOf(balance.coin, total))}</Cell>
              </Row>
            )
          })}

          {!balances.length && perpsUsd === 0 && (
            <Empty>{t("perps.account.spotBalances.empty")}</Empty>
          )}
        </>
      )}

      {tab === "positions" && (
        <>
          <Row columns={POSITION_COLS} isHeader>
            <Cell align="left" mono={false}>
              {t("perps.col.coin")}
            </Cell>
            <Cell mono={false}>{t("perps.col.size")}</Cell>
            <Cell mono={false}>{t("perps.col.entry")}</Cell>
            <Cell mono={false}>{t("perps.col.value")}</Cell>
            <Cell mono={false}>{t("perps.col.pnl")}</Cell>
            <Cell mono={false}>{""}</Cell>
          </Row>

          {positions.length === 0 ? (
            <Empty>{t("perps.positions.empty")}</Empty>
          ) : (
            positions.map(({ position }) => {
              const size = Number(position.szi)
              const isLong = size > 0
              const pnl = Number(position.unrealizedPnl)
              const roe = Number(position.returnOnEquity) * 100
              const color = pnl >= 0 ? "green400" : "red400"

              return (
                <Row key={position.coin} columns={POSITION_COLS}>
                  <Flex gap="xs" align="center">
                    <Text fs="p6" font="mono" fw={600}>
                      {position.coin}
                    </Text>
                    <Text
                      fs="p6"
                      font="mono"
                      color={isLong ? "green400" : "red400"}
                    >
                      {`${position.leverage.value}x`}
                    </Text>
                  </Flex>
                  <Cell color={isLong ? "green400" : "red400"}>
                    {position.szi}
                  </Cell>
                  <Cell>{position.entryPx}</Cell>
                  <Cell>{usd(Number(position.positionValue))}</Cell>
                  <Cell color={color}>
                    {`${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} (${roe.toFixed(2)}%)`}
                  </Cell>
                  <Button
                    size="small"
                    variant="muted"
                    disabled={placeOrder.isPending}
                    sx={{ borderRadius: 4 }}
                    onClick={() =>
                      placeOrder.mutate({
                        symbol: position.coin,
                        isBuy: !isLong,
                        size: String(Math.abs(size)),
                        price: closePrice(position.coin, position.entryPx),
                        tif: "FrontendMarket",
                        reduceOnly: true,
                      })
                    }
                  >
                    {t("perps.positions.close")}
                  </Button>
                </Row>
              )
            })
          )}
        </>
      )}

      {tab === "orders" && (
        <>
          <Row columns={ORDER_COLS} isHeader>
            <Cell align="left" mono={false}>
              {t("perps.col.coin")}
            </Cell>
            <Cell mono={false}>{t("perps.col.side")}</Cell>
            <Cell mono={false}>{t("perps.col.size")}</Cell>
            <Cell mono={false}>{t("perps.col.price")}</Cell>
            <Cell mono={false}>{""}</Cell>
          </Row>

          {!orders?.length ? (
            <Empty>{t("perps.orders.empty")}</Empty>
          ) : (
            orders.map((order) => (
              <Row key={order.oid} columns={ORDER_COLS}>
                <Cell align="left">{order.coin}</Cell>
                <Cell color={order.side === "B" ? "green400" : "red400"}>
                  {order.side === "B" ? "BUY" : "SELL"}
                </Cell>
                <Cell>{order.sz}</Cell>
                <Cell>{order.limitPx}</Cell>
                <Button
                  size="small"
                  variant="muted"
                  disabled={cancelOrder.isPending}
                  sx={{ borderRadius: 4 }}
                  onClick={() =>
                    cancelOrder.mutate({ symbol: order.coin, oid: order.oid })
                  }
                >
                  {t("perps.orders.cancel")}
                </Button>
              </Row>
            ))
          )}
        </>
      )}

      <PerpsDeposit open={isDepositOpen} onOpenChange={setIsDepositOpen} />
    </PerpsPanel>
  )
}

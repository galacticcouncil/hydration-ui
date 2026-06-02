import {
  Button,
  DataTable,
  Flex,
  Modal,
  Paper,
  PaperProps,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { TabMenuBadge } from "@/components/TabMenu/TabMenuBadge"
import { TradeOrderHistoryItem } from "@/modules/trade/orders/lib/tradeOrdersHistory.types"
import { useTradeOrdersHistoryData } from "@/modules/trade/orders/lib/useTradeOrdersHistoryData"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TradeOrderHistoryDetailsModal } from "@/modules/trade/orders/TradeOrderHistoryDetailsModal"
import { useTradeOrdersHistoryColumns } from "@/modules/trade/orders/TradeOrdersHistory.columns"

type Filter = "all" | "open" | "history"

const filterLabelKeys = {
  all: "trade.orders.history.all",
  open: "trade.orders.history.open",
  history: "trade.orders.history.finished",
} as const satisfies Record<Filter, string>

const filters = Object.keys(filterLabelKeys) as ReadonlyArray<Filter>

export const TradeOrdersHistory: FC<PaperProps> = (props) => {
  const { t } = useTranslation("trade")

  const [filter, setFilter] = useState<Filter>("all")
  const [selected, setSelected] = useState<TradeOrderHistoryItem | null>(null)

  const { orders, isLoading } = useTradeOrdersHistoryData()
  const columns = useTradeOrdersHistoryColumns()

  const openOrders = useMemo(() => {
    return orders.filter((order) => order.status === null)
  }, [orders])

  const historyOrders = useMemo(() => {
    return orders.filter((order) => order.status !== null)
  }, [orders])

  const filteredOrders = (() => {
    switch (filter) {
      case "all":
        return orders
      case "open":
        return openOrders
      case "history":
        return historyOrders
    }
  })()

  return (
    <Paper {...props}>
      <Flex gap="base" align="center" my="l" px="xl">
        {filters.map((value) => (
          <Button
            key={value}
            size="small"
            variant={filter === value ? "secondary" : "muted"}
            sx={{ minWidth: "2xl", flexShrink: 0 }}
            onClick={() => setFilter(value)}
          >
            {t(filterLabelKeys[value])}
            {value === "open" && (
              <TabMenuBadge>{openOrders.length}</TabMenuBadge>
            )}
          </Button>
        ))}
      </Flex>
      <Separator />
      <TableContainer borderRadius="xl">
        <DataTable
          data={filteredOrders}
          columns={columns}
          isLoading={isLoading}
          emptyState={<OrdersEmptyState />}
          onRowClick={(item) => setSelected(item)}
          paginated
          pageSize={10}
        />
      </TableContainer>
      <Modal open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <TradeOrderHistoryDetailsModal
            details={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </Modal>
    </Paper>
  )
}

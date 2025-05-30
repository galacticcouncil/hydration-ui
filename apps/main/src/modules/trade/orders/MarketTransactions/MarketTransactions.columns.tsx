import { ArrowRightLeft } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  TableRowDetailsExpandMobile,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AccountDate } from "@/modules/trade/orders/columns/AccountDate"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { TransactionType } from "@/modules/trade/orders/columns/TransactionType"
import { SwapData } from "@/modules/trade/orders/lib/useSwapsData"
import { SwapDetailsMobile } from "@/modules/trade/orders/SwapDetailsMobile"

const columnHelper = createColumnHelper<SwapData>()

export const useMarketTransactionsColumns = () => {
  const { t } = useTranslation(["common", "trade"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.inOut"),
      cell: ({ row }) => {
        return (
          <SwapAmount
            fromAmount={row.original.fromAmount}
            from={row.original.from}
            toAmount={row.original.toAmount}
            to={row.original.to}
          />
        )
      },
    })

    const typeColumn = columnHelper.display({
      id: "type",
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return row.original.type && <TransactionType type={row.original.type} />
      },
    })

    const fillPriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap={4} align="center" justify="center">
          {t("trade:trade.orders.marketTransactions.fillPrice")}
          <Icon
            size={12}
            component={ArrowRightLeft}
            color={getToken("textButtons.small.hover")}
          />
        </Flex>
      ),
      cell: ({ row }) => {
        return (
          <SwapPrice
            from={row.original.from}
            to={row.original.to}
            price={row.original.fillPrice}
          />
        )
      },
    })

    const dateColumn = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.accountDate"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return (
          <AccountDate
            align="center"
            address={row.original.address}
            timestamp={row.original.timestamp}
          />
        )
      },
    })

    const fromToColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.fromTo.mobile"),
      cell: ({ row }) => {
        return (
          <div>
            <SwapAmount
              fromAmount={row.original.fromAmount}
              from={row.original.from}
              toAmount={row.original.toAmount}
              to={row.original.to}
            />
            {row.original.type && <TransactionType type={row.original.type} />}
          </div>
        )
      },
    })

    const dateColumnMobile = columnHelper.display({
      header: t("trade:trade.orders.marketTransactions.accountDate"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: function Cell({ row }) {
        const [modal, setModal] = useState(false)

        return (
          <TableRowDetailsExpandMobile onClick={() => setModal(true)}>
            <AccountDate
              align="end"
              address={row.original.address}
              timestamp={row.original.timestamp}
            />
            <Modal open={modal} onOpenChange={setModal}>
              <ModalHeader title="Swap details" align="center" />
              <ModalContentDivider />
              <ModalBody>
                <SwapDetailsMobile details={row.original} />
              </ModalBody>
            </Modal>
          </TableRowDetailsExpandMobile>
        )
      },
    })

    return isMobile
      ? [fromToColumnMobile, dateColumnMobile]
      : [fromToColumn, typeColumn, fillPriceColumn, dateColumn]
  }, [t, isMobile])
}

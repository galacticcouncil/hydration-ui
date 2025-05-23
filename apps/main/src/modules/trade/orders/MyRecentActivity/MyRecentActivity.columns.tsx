import {
  ArrowRightLeft,
  ChevronRight,
  Trash,
} from "@galacticcouncil/ui/assets/icons"
import { ProjectRecraft } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ButtonIcon,
  ExternalLink,
  Flex,
  Icon,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { getSubscanLink } from "@/links/subscan"
import { SwapAmount } from "@/modules/trade/orders/columns/SwapAmount"
import { SwapPrice } from "@/modules/trade/orders/columns/SwapPrice"
import { SwapStatus } from "@/modules/trade/orders/columns/SwapStatus"
import { SwapType } from "@/modules/trade/orders/columns/SwapType"
import { TAsset } from "@/providers/assetsProvider"

export type MyRecentActivitySwap = {
  readonly from: TAsset
  readonly fromAmount: string
  readonly to: TAsset
  readonly toAmount: string
  readonly fillPrice: string
  readonly type: SwapType
  readonly status: SwapStatus
}

const columnHelper = createColumnHelper<MyRecentActivitySwap>()

export const useMyRecentActivityColumns = () => {
  const { t } = useTranslation(["common", "trade"])

  return useMemo(() => {
    const fromToColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.fromTo"),
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

    const fillPriceColumn = columnHelper.display({
      id: "price",
      meta: {
        sx: { textAlign: "center" },
      },
      header: () => (
        <Flex gap={4} align="center" justify="center">
          {t("trade:trade.orders.myActivity.fillPrice")}
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

    const typeColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.type"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return <SwapType type={row.original.type} />
      },
    })

    const statusColumn = columnHelper.display({
      header: t("trade:trade.orders.myActivity.status"),
      meta: {
        sx: { textAlign: "end" },
      },
      cell: ({ row }) => {
        return <SwapStatus status={row.original.status} />
      },
    })

    const actionColumn = columnHelper.display({
      id: "ations",
      cell: ({ row }) => {
        return (
          <Flex gap={9} align="center" justify="end">
            {row.original.status.type === "active" ? (
              <Button variant="danger" outline>
                <Icon component={Trash} size={14} />
              </Button>
            ) : (
              <ButtonIcon>
                <Icon component={ProjectRecraft} size={14} color="#FEFEFE" />
              </ButtonIcon>
            )}
            {/* TODO link */}
            <ExternalLink href={getSubscanLink(row.original)}>
              <Icon
                component={ChevronRight}
                size={16}
                color={getToken("icons.onContainer")}
              />
            </ExternalLink>
          </Flex>
        )
      },
    })

    return [
      fromToColumn,
      fillPriceColumn,
      typeColumn,
      statusColumn,
      actionColumn,
    ]
  }, [t])
}

import {
  CircleCheckBig,
  CircleOff,
  Minus,
  Plus,
} from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Modal,
  TableRowDetailsExpand,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { CSSProperties, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmount } from "@/components/AssetAmount/AssetAmount"
import { CancelOtcOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelOtcOrderModalContent"
import { FillOrderModalContent } from "@/modules/trade/otc/fill-order/FillOrderModalContent"
import { OfferMarketPriceColumn } from "@/modules/trade/otc/table/columns/OfferMarketPriceColumn"
import { OfferPriceColumn } from "@/modules/trade/otc/table/columns/OfferPriceColumn"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { logically, nullLast, numerically, sortBy } from "@/utils/sort"

export enum OtcColumn {
  MarketPrice = "MarketPrice",
  Price = "Price",
  PartiallyFillable = "PartiallyFillable",
  Actions = "Actions",
}

export const otcColumnSortPriority: ReadonlyArray<OtcColumn> = [
  OtcColumn.PartiallyFillable,
]

export type OtcOfferTabular = OtcOffer & {
  readonly offerPrice: string | null
  readonly marketPricePercentage: number | null
}

const columnHelper = createColumnHelper<OtcOfferTabular>()

export const useOtcTableColums = () => {
  const { t } = useTranslation(["trade", "common"])
  const { isMobile } = useBreakpoints()

  const { account } = useAccount()
  const userAddress = account?.address ?? ""

  return useMemo(() => {
    const offer = columnHelper.accessor("assetOut.name", {
      header: t("common:offer"),
      enableSorting: false,
      cell: ({ row }) => {
        const { assetOut, amountOut } = row.original

        return <AssetAmount asset={assetOut} amount={amountOut} />
      },
    })

    const accepting = columnHelper.accessor("assetIn.name", {
      header: t("common:accepting"),
      enableSorting: false,
      cell: function Cell({ row }) {
        const { isMobile } = useBreakpoints()

        return (
          <AssetAmount
            asset={row.original.assetIn}
            amount={isMobile ? undefined : row.original.amountIn}
          />
        )
      },
    })

    const price = columnHelper.display({
      id: OtcColumn.Price,
      header: t("common:price"),
      meta: {
        sx: { textAlign: "center" },
      },
      cell: ({ row }) => {
        return (
          <OfferPriceColumn
            offerPrice={row.original.offerPrice}
            assetOutSymbol={row.original.assetOut.symbol}
          />
        )
      },
    })

    const marketPricePercentage = columnHelper.accessor(
      "marketPricePercentage",
      {
        id: OtcColumn.MarketPrice,
        header: t("common:marketPrice"),
        meta: {
          sx: { textAlign: "center" },
        },
        sortingFn: sortBy({
          select: (row) => row.original.marketPricePercentage,
          compare: nullLast(numerically),
        }),
        cell: ({ row }) => {
          return (
            <OfferMarketPriceColumn
              percentage={row.original.marketPricePercentage}
            />
          )
        },
      },
    )

    const profitMobile = columnHelper.accessor("marketPricePercentage", {
      id: OtcColumn.MarketPrice,
      header: t("common:marketPrice"),
      sortingFn: sortBy({
        select: (row) => row.original.marketPricePercentage,
        compare: nullLast(numerically),
      }),
      cell: ({ row }) => (
        <TableRowDetailsExpand>
          <OfferMarketPriceColumn
            percentage={row.original.marketPricePercentage}
          />
        </TableRowDetailsExpand>
      ),
    })

    const partiallyFillable = columnHelper.accessor("isPartiallyFillable", {
      id: OtcColumn.PartiallyFillable,
      header: t("otc.partiallyFillable"),
      meta: {
        sx: { textAlign: "center" },
      },
      sortingFn: sortBy({
        select: (row) => row.original.isPartiallyFillable,
        compare: logically,
      }),
      cell: ({ row }) => {
        return (
          <Flex justify="center">
            <Icon
              size="m"
              component={
                row.original.isPartiallyFillable ? CircleCheckBig : CircleOff
              }
              color={
                row.original.isPartiallyFillable
                  ? getToken("icons.onContainer")
                  : getToken("icons.onSurface")
              }
            />
          </Flex>
        )
      },
    })

    const actions = columnHelper.display({
      id: OtcColumn.Actions,
      meta: {
        sx: { textAlign: "right" },
      },
      cell: function Cell({ row }) {
        const { isConnected } = useAccount()

        const [modal, setModal] = useState<"none" | "fill" | "cancel">("none")
        const [fillWidth, setFillWidth] = useState(0)
        const [cancelWidth, setCancelWidth] = useState(0)

        const buttonWidth = Math.max(fillWidth, cancelWidth)

        // renders both buttons but shows only the relevant one because they need to have equal width
        const hiddenStyle: CSSProperties = {
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none",
        }

        const isUsersOffer = row.original.owner === userAddress

        return (
          <>
            <Flex justify="right">
              <Button
                ref={useCallback(
                  (el: HTMLElement | null) =>
                    setFillWidth(el?.offsetWidth ?? 0),
                  [],
                )}
                style={!isUsersOffer ? {} : hiddenStyle}
                variant="accent"
                minWidth={buttonWidth}
                outline
                disabled={!isConnected}
                onClick={(e) => {
                  e.stopPropagation()
                  setModal("fill")
                }}
              >
                <Plus />
                {t("otc.fillOrder.cta")}
              </Button>
              <Button
                ref={useCallback(
                  (el: HTMLElement | null) =>
                    setCancelWidth(el?.offsetWidth ?? 0),
                  [],
                )}
                style={isUsersOffer ? {} : hiddenStyle}
                variant="danger"
                minWidth={buttonWidth}
                outline
                disabled={!isConnected}
                onClick={(e) => {
                  e.stopPropagation()
                  setModal("cancel")
                }}
              >
                <Minus />
                {t("trade.cancelOrder.cta")}
              </Button>
            </Flex>
            <Modal
              open={modal === "fill"}
              onOpenChange={() => setModal("none")}
            >
              <FillOrderModalContent
                otcOffer={row.original}
                isUsersOffer={isUsersOffer}
                onClose={() => setModal("none")}
              />
            </Modal>
            <Modal
              open={modal === "cancel"}
              onOpenChange={() => setModal("none")}
            >
              <CancelOtcOrderModalContent
                otcOffer={row.original}
                onBack={() => setModal("none")}
                onClose={() => setModal("none")}
              />
            </Modal>
          </>
        )
      },
    })

    return isMobile
      ? [offer, accepting, profitMobile]
      : [
          offer,
          accepting,
          price,
          marketPricePercentage,
          partiallyFillable,
          actions,
        ]
  }, [isMobile, t, userAddress])
}

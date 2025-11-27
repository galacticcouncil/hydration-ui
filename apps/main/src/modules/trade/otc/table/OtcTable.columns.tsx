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
import {
  useAccount,
  useHydraAccountAddress,
} from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmount } from "@/components/AssetAmount/AssetAmount"
import { CancelOtcOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelOtcOrderModalContent"
import { FillOrderModalContent } from "@/modules/trade/otc/fill-order/FillOrderModalContent"
import { OfferMarketPriceColumn } from "@/modules/trade/otc/table/columns/OfferMarketPriceColumn"
import { OfferPriceColumn } from "@/modules/trade/otc/table/columns/OfferPriceColumn"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import {
  logically,
  nullFirst,
  nullLast,
  numerically,
  sortBy,
} from "@/utils/sort"

export enum OtcColumn {
  MarketPrice = "MarketPrice",
  Price = "Price",
  Status = "Status",
  Actions = "Actions",
}

export type OtcOfferTabular = OtcOffer & {
  readonly offerPrice: string | null
  readonly marketPricePercentage: number | null
}

const columnHelper = createColumnHelper<OtcOfferTabular>()

export const useOtcTableColums = () => {
  const { t } = useTranslation(["trade", "common"])
  const { isMobile } = useBreakpoints()

  const userAddress = useHydraAccountAddress()

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
      cell: ({ row }) => {
        const { assetIn, amountIn } = row.original

        return <AssetAmount asset={assetIn} amount={amountIn} />
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
      header: t("common:profit"),
      sortingFn: sortBy({
        select: (row) => row.original.marketPricePercentage,
        compare: nullFirst(numerically),
      }),
      cell: function Cell({ row }) {
        const { isConnected } = useAccount()
        const [isFillOpen, setIsFillOpen] = useState(false)

        return (
          <>
            <TableRowDetailsExpand
              disabled={!isConnected}
              onClick={() => setIsFillOpen(true)}
            >
              <OfferMarketPriceColumn
                percentage={row.original.marketPricePercentage}
              />
            </TableRowDetailsExpand>
            <Modal open={isFillOpen} onOpenChange={setIsFillOpen}>
              <FillOrderModalContent
                otcOffer={row.original}
                isUsersOffer={row.original.owner === userAddress}
                onClose={() => setIsFillOpen(false)}
              />
            </Modal>
          </>
        )
      },
    })

    const partiallyFillable = columnHelper.accessor("isPartiallyFillable", {
      id: OtcColumn.Status,
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
              size={18}
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

        const isUsersOffer = row.original.owner === userAddress

        return (
          <>
            <Flex justify="right">
              <Button
                variant={isUsersOffer ? "danger" : "accent"}
                outline
                disabled={!isConnected}
                onClick={() => setModal(isUsersOffer ? "cancel" : "fill")}
              >
                {isUsersOffer ? <Minus /> : <Plus />}
                {isUsersOffer
                  ? t("trade.cancelOrder.cta")
                  : t("otc.fillOrder.cta")}
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
      ? [offer, price, profitMobile]
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

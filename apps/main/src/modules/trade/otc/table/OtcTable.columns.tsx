import { Add, ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ButtonTransparent,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
  Flex,
  ModalContent,
  ModalRoot,
  ModalTrigger,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmount } from "@/components/AssetAmount/AssetAmount"
import { FillOrderModalContent } from "@/modules/trade/otc/fill-order/FillOrderModalContent"
import { OfferMarketPriceColumn } from "@/modules/trade/otc/table/columns/OfferMarketPriceColumn"
import { OfferPriceColumn } from "@/modules/trade/otc/table/columns/OfferPriceColumn"
import { OfferStatusColumn } from "@/modules/trade/otc/table/columns/OfferStatusColumn"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { nullFirst, numerically, sortBy } from "@/utils/sort"

export enum OtcColumn {
  MarketPrice = "MarketPrice",
  Price = "Price",
  Status = "Status",
  Actions = "Actions",
}

export type OtcOfferTabular = OtcOffer & {
  readonly assetAmountIn: string
  readonly assetAmountOut: string
  readonly offerPrice: string | null
  readonly marketPricePercentage: number | null
}

const columnHelper = createColumnHelper<OtcOfferTabular>()

export const useOtcTableColums = () => {
  const { t } = useTranslation(["trade", "common"])
  const { isMobile } = useBreakpoints()

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
        sortingFn: sortBy({
          select: (row) => row.original.marketPricePercentage,
          compare: nullFirst(numerically),
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
          <Flex
            justify="space-between"
            align="center"
            sx={{ overflow: "hidden" }}
          >
            <OfferMarketPriceColumn
              percentage={row.original.marketPricePercentage}
            />
            <DrawerRoot open={isFillOpen} onOpenChange={setIsFillOpen}>
              <DrawerTrigger asChild>
                <ButtonTransparent
                  disabled={!isConnected}
                  sx={{ flexShrink: 0 }}
                >
                  <ChevronRight size={18} />
                </ButtonTransparent>
              </DrawerTrigger>
              <DrawerContent>
                <FillOrderModalContent
                  otcOffer={row.original}
                  onClose={() => setIsFillOpen(false)}
                />
              </DrawerContent>
            </DrawerRoot>
          </Flex>
        )
      },
    })

    const status = columnHelper.display({
      id: OtcColumn.Status,
      header: "Order status",
      cell: ({ row }) => {
        const { id, assetIn, assetAmountIn, isPartiallyFillable } = row.original

        return (
          <OfferStatusColumn
            offerId={id}
            assetInAmount={assetAmountIn}
            assetInDecimals={assetIn.decimals}
            isPartiallyFillable={isPartiallyFillable}
          />
        )
      },
    })

    const actions = columnHelper.display({
      id: OtcColumn.Actions,
      cell: function Cell({ row }) {
        const { isConnected } = useAccount()
        const [isFillOpen, setIsFillOpen] = useState(false)

        return (
          <ModalRoot open={isFillOpen} onOpenChange={setIsFillOpen}>
            <ModalTrigger asChild>
              <Button
                variant="accent"
                outline
                disabled={!isConnected}
                iconStart={Add}
              >
                {t("otc.fillOrder.cta")}
              </Button>
            </ModalTrigger>
            <ModalContent>
              <FillOrderModalContent
                otcOffer={row.original}
                onClose={() => setIsFillOpen(false)}
              />
            </ModalContent>
          </ModalRoot>
        )
      },
    })

    return isMobile
      ? [offer, price, profitMobile]
      : [offer, accepting, price, marketPricePercentage, status, actions]
  }, [isMobile, t])
}

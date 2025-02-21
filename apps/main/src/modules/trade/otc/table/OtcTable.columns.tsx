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
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetAmount } from "@/components/AssetAmount/AssetAmount"
import { OfferMarketPriceColumn } from "@/modules/trade/otc/table/columns/OfferMarketPriceColumn"
import { OfferPriceColumn } from "@/modules/trade/otc/table/columns/OfferPriceColumn"
import { OfferStatusColumn } from "@/modules/trade/otc/table/columns/OfferStatusColumn"
import { FillORderModalContent } from "@/modules/trade/otc/table/fill-order/FillOrderModalContent"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"

export enum OtcColumn {
  MarketPrice = "MarketPrice",
}

export type OtcOfferTabular = OtcOffer & {
  readonly assetAmountIn: string
  readonly assetAmountOut: string
  readonly offerPrice: string | null
  readonly marketPricePercentage: number | null
}

const columnHelper = createColumnHelper<OtcOfferTabular>()

export const useOtcTableColums = () => {
  const { t } = useTranslation()
  const { gte } = useBreakpoints()
  const isMobile = !gte("sm")

  return useMemo(() => {
    const offer = columnHelper.accessor("assetOut.name", {
      header: t("offer"),
      enableSorting: false,
      cell: ({ row }) => {
        const { assetOutId, assetOut, amountOut } = row.original

        return (
          <AssetAmount
            assetId={assetOutId}
            asset={assetOut}
            amount={amountOut}
          />
        )
      },
    })

    const accepting = columnHelper.accessor("assetIn.name", {
      header: t("accepting"),
      enableSorting: false,
      cell: ({ row }) => {
        const { assetInId, assetIn, amountIn } = row.original

        return (
          <AssetAmount assetId={assetInId} asset={assetIn} amount={amountIn} />
        )
      },
    })

    const price = columnHelper.display({
      header: t("price"),
      cell: ({ row }) => {
        return (
          <OfferPriceColumn
            offerPrice={row.original.offerPrice}
            assetOutSymbol={row.original.assetOut?.symbol}
          />
        )
      },
    })

    const marketPricePercentage = columnHelper.accessor(
      "marketPricePercentage",
      {
        id: OtcColumn.MarketPrice,
        header: t("marketPrice"),
        sortingFn: (row1, row2) => {
          const percentage1 = row1.original.marketPricePercentage
          const percentage2 = row2.original.marketPricePercentage

          if (percentage1 === null) {
            return -1
          }
          if (percentage2 === null) {
            return 1
          }

          return percentage1 - percentage2
        },
        cell: ({ row }) => {
          return (
            <OfferMarketPriceColumn
              percentage={row.original.marketPricePercentage}
            />
          )
        },
      },
    )

    const profitMobile = columnHelper.display({
      header: t("profit"),
      cell: function Cell({ row }) {
        const isSigned = useWeb3Connect((s) => !!s.account)

        return (
          <Flex
            justify="space-between"
            align="center"
            sx={{ overflow: "hidden" }}
          >
            <OfferMarketPriceColumn
              percentage={row.original.marketPricePercentage}
            />
            <DrawerRoot>
              <DrawerTrigger asChild>
                <ButtonTransparent disabled={!isSigned} sx={{ flexShrink: 0 }}>
                  <ChevronRight />
                </ButtonTransparent>
              </DrawerTrigger>
              <DrawerContent>
                <FillORderModalContent />
              </DrawerContent>
            </DrawerRoot>
          </Flex>
        )
      },
    })

    const status = columnHelper.display({
      header: "Order status",
      cell: ({ row }) => {
        const { id, assetIn, assetAmountIn, isPartiallyFillable } = row.original

        return (
          <OfferStatusColumn
            offerId={id}
            assetInAmount={assetAmountIn}
            assetInDp={assetIn?.decimals}
            isPartiallyFillable={isPartiallyFillable}
          />
        )
      },
    })

    const actions = columnHelper.display({
      id: "actions",
      cell: function Cell() {
        const isSigned = useWeb3Connect((s) => !!s.account)

        return (
          <ModalRoot>
            <ModalTrigger asChild>
              <Button
                variant="accent"
                outline
                disabled={!isSigned}
                iconStart={Add}
              >
                {t("trade.otc.fillOrder.cta")}
              </Button>
            </ModalTrigger>
            <ModalContent>
              <FillORderModalContent />
            </ModalContent>
          </ModalRoot>
        )
      },
    })

    return isMobile
      ? [offer, price, profitMobile]
      : [offer, accepting, price, marketPricePercentage, status, actions]
  }, [t, isMobile])
}

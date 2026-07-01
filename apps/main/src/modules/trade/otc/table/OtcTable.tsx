import {
  DataTable,
  Modal,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { FillOrderModalContent } from "@/modules/trade/otc/fill-order/FillOrderModalContent"
import {
  OtcOfferTabular,
  useOtcTableColums,
} from "@/modules/trade/otc/table/OtcTable.columns"
import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"
import {
  getOtcOfferFilter,
  mapOtcOffersToTableData,
} from "@/modules/trade/otc/table/OtcTable.utils"
import { useOtcFulfillmentPercentages } from "@/modules/trade/otc/table/useOtcFulfillmentPercentages"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
  readonly sortingProps: SortingProps
}

export const OtcTable: FC<Props> = ({
  searchPhrase,
  paginationProps,
  sortingProps,
}) => {
  const { t } = useTranslation("trade")
  const { offers: offersType } = useSearch({ from: "/trade/otc" })

  const [isDetailOpen, setIsDetailOpen] = useState<OtcOfferTabular | null>(null)

  const { data, isLoading } = useOtcOffers()
  const columns = useOtcTableColums()

  const { account } = useAccount()
  const userAddress = account?.address ?? ""

  const filteredOffers = useMemo(
    () => data?.filter(getOtcOfferFilter(offersType, userAddress)) ?? [],
    [data, offersType, userAddress],
  )

  const assetIds = useMemo(
    () => [
      ...new Set(
        filteredOffers.flatMap((offer) => [
          offer.assetIn.id,
          offer.assetOut.id,
        ]),
      ),
    ],
    [filteredOffers],
  )

  const { isLoading: isPriceLoading, prices } = useAssetsPrice(assetIds)

  const isTableLoading = isLoading || isPriceLoading

  // OTC fee + per-order AMM fulfillment quotes (remaining size, incl. impact + fee).
  const rpc = useRpcProvider()
  const { data: feePct = "0" } = useQuery(otcTradeFeeQuery(rpc))
  const fulfillment = useOtcFulfillmentPercentages(filteredOffers, feePct)

  const offersWithPrices = useMemo<OtcOfferTabular[]>(
    () =>
      isTableLoading
        ? []
        : filteredOffers.map((offer) => {
            const priced = mapOtcOffersToTableData(prices)(offer)
            const result = offer.id ? fulfillment.get(offer.id) : undefined

            return {
              ...priced,
              marketPricePercentage: result?.pct ?? null,
              isMarketLoading: result?.isLoading ?? false,
            }
          }),
    [filteredOffers, prices, isTableLoading, fulfillment],
  )

  return (
    <>
      <TableContainer as={Paper}>
        <DataTable
          paginated
          {...paginationProps}
          {...sortingProps}
          globalFilter={searchPhrase}
          globalFilterFn={(row) =>
            matchAsset(row.original.assetIn, searchPhrase) ||
            matchAsset(row.original.assetOut, searchPhrase)
          }
          data={offersWithPrices}
          columns={columns}
          isLoading={isTableLoading}
          emptyState={t("otc.noOrders")}
          isMultiSort
          onRowClick={account ? setIsDetailOpen : undefined}
        />
      </TableContainer>
      <Modal
        variant="popup"
        open={!!isDetailOpen}
        onOpenChange={() => setIsDetailOpen(null)}
      >
        {isDetailOpen && (
          <FillOrderModalContent
            otcOffer={isDetailOpen}
            isUsersOffer={isDetailOpen.owner === userAddress}
            onClose={() => setIsDetailOpen(null)}
          />
        )}
      </Modal>
    </>
  )
}

const matchAsset = (asset: TAsset, searchPhrase: string): boolean =>
  asset.symbol.toLowerCase().includes(searchPhrase.toLowerCase()) ||
  asset.name.toLowerCase().includes(searchPhrase.toLowerCase())

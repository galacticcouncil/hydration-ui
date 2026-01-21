import {
  DataTable,
  Modal,
  Paper,
  TableContainer,
  usePriorityTableSort,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { FillOrderModalContent } from "@/modules/trade/otc/fill-order/FillOrderModalContent"
import {
  OtcColumn,
  otcColumnSortPriority,
  OtcOfferTabular,
  useOtcTableColums,
} from "@/modules/trade/otc/table/OtcTable.columns"
import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"
import {
  getOtcOfferFilter,
  mapOtcOffersToTableData,
} from "@/modules/trade/otc/table/OtcTable.utils"
import { TAsset } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"

type Props = {
  readonly searchPhrase: string
}

export const OtcTable: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("trade")
  const { offers: offersType } = useSearch({ from: "/trade/otc" })

  const [sortState, setSortState] = usePriorityTableSort(
    otcColumnSortPriority,
    [{ id: OtcColumn.MarketPrice, desc: false }],
  )

  const [isDetailOpen, setIsDetailOpen] = useState<OtcOfferTabular | null>(null)

  const { data, isLoading } = useOtcOffers()
  const columns = useOtcTableColums()

  const { account } = useAccount()
  const userAddress = account?.address ?? ""

  const filteredOffers = useMemo(
    // @ts-expect-error works
    () => data?.filter(getOtcOfferFilter(offersType, userAddress)) ?? [],
    [data, offersType, userAddress],
  )

  const assetIds = useMemo(
    () =>
      new Set(
        // @ts-expect-error works
        filteredOffers.flatMap((offer) => [
          offer.assetIn.id,
          offer.assetOut.id,
        ]),
      )
        .values()
        .toArray(),
    [filteredOffers],
  )

  // @ts-expect-error works
  const { isLoading: isPriceLoading, prices } = useAssetsPrice(assetIds)

  const isTableLoading = isLoading || isPriceLoading

  const offersWithPrices = useMemo(
    () =>
      isTableLoading ? [] : filteredOffers.map(mapOtcOffersToTableData(prices)),
    [filteredOffers, prices, isTableLoading],
  )

  return (
    <>
      <TableContainer as={Paper}>
        <DataTable
          paginated
          pageSize={10}
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
          sorting={sortState}
          onSortingChange={setSortState}
          onRowClick={account ? setIsDetailOpen : undefined}
        />
      </TableContainer>
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
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

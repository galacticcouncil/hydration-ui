import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useHydraAccountAddress } from "@galacticcouncil/web3-connect"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  OtcColumn,
  useOtcTableColums,
} from "@/modules/trade/otc/table/OtcTable.columns"
import { useOtcOffersQuery } from "@/modules/trade/otc/table/OtcTable.query"
import {
  getOtcOfferFilter,
  mapOtcOffersToTableData,
} from "@/modules/trade/otc/table/OtcTable.utils"
import { Route } from "@/routes/_trade/trade.otc"
import { useAssetsPrice } from "@/states/displayAsset"

type Props = {
  readonly searchPhrase: string
}

export const OtcTable: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("trade")
  const { offers: offersType } = Route.useSearch()

  const { data, isLoading } = useOtcOffersQuery()
  const columns = useOtcTableColums()

  const userAddress = useHydraAccountAddress()

  const filteredOffers = useMemo(
    () => data.filter(getOtcOfferFilter(offersType, userAddress)),
    [data, offersType, userAddress],
  )

  const assetIds = useMemo(
    () =>
      new Set(
        filteredOffers.flatMap((offer) => [
          offer.assetIn.id,
          offer.assetOut.id,
        ]),
      )
        .values()
        .toArray(),
    [filteredOffers],
  )

  const assetPrices = useAssetsPrice(assetIds)
  const areSpotPricesLoading = Object.values(assetPrices).reduce(
    (areSpotPricesLoading, spotPrice) =>
      areSpotPricesLoading || spotPrice.isLoading,
    false,
  )

  const isTableLoading = isLoading || areSpotPricesLoading

  const offersWithPrices = useMemo(
    () =>
      isTableLoading
        ? []
        : filteredOffers.map(mapOtcOffersToTableData(assetPrices)),
    [filteredOffers, assetPrices, isTableLoading],
  )

  return (
    <TableContainer as={Paper}>
      <DataTable
        paginated
        pageSize={10}
        globalFilter={searchPhrase}
        data={offersWithPrices}
        columns={columns}
        isLoading={isTableLoading}
        initialSorting={[{ id: OtcColumn.MarketPrice, desc: true }]}
        noResultsMessage={t("otc.noOrders")}
      />
    </TableContainer>
  )
}

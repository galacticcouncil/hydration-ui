import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useHydraAccountAddress } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
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
import { useAssets } from "@/providers/assetsProvider"
import { useAssetsPrice } from "@/states/displayAsset"

type Props = {
  readonly searchPhrase: string
}

export const OtcTable: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation("trade")
  const { offers: offersType } = useSearch({ from: "/trade/otc" })

  const { getAsset } = useAssets()
  const { data, isLoading } = useOtcOffersQuery()
  const columns = useOtcTableColums()

  const userAddress = useHydraAccountAddress()

  const filteredOffers = useMemo(
    () => data?.filter(getOtcOfferFilter(offersType, userAddress)) ?? [],
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

  const {
    isLoading: isPriceLoading,
    referenceAssetId,
    prices,
  } = useAssetsPrice(assetIds)

  const referenceAsset = getAsset(referenceAssetId)

  const isTableLoading = isLoading || isPriceLoading

  const offersWithPrices = useMemo(
    () =>
      isTableLoading
        ? []
        : filteredOffers.map(
            mapOtcOffersToTableData(prices, referenceAsset?.decimals ?? null),
          ),
    [filteredOffers, prices, referenceAsset?.decimals, isTableLoading],
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
        emptyState={t("otc.noOrders")}
      />
    </TableContainer>
  )
}

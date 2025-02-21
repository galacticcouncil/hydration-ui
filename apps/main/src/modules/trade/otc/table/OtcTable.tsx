import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useWeb3Connect } from "@galacticcouncil/web3-connect"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
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

const HYDRA_ADDRESS_PREFIX = 63

function safeConvertAddressSS58(
  address: string | undefined,
  ss58prefix: number,
) {
  try {
    return encodeAddress(decodeAddress(address), ss58prefix)
  } catch {
    return null
  }
}

type Props = {
  readonly searchPhrase: string
}

export const OtcTable: FC<Props> = ({ searchPhrase }) => {
  const { t } = useTranslation()
  const { offers: offersType } = Route.useSearch()

  const { data, isLoading } = useOtcOffersQuery()
  const columns = useOtcTableColums()

  const accountAddress = useWeb3Connect((s) => s.account?.address)
  const userAddress = safeConvertAddressSS58(
    accountAddress,
    HYDRA_ADDRESS_PREFIX,
  )

  const filteredOffers = useMemo(
    () => data.filter(getOtcOfferFilter(offersType, userAddress)),
    [data, offersType, userAddress],
  )

  const assetIds = useMemo(
    () =>
      new Set(
        filteredOffers.flatMap((offer) => [offer.assetInId, offer.assetOutId]),
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
        noResultsMessage={t("trade.otc.noOrders")}
      />
    </TableContainer>
  )
}

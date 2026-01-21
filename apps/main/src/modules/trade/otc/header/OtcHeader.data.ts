import { useDisplayAssetsPrice } from "@/components/AssetPrice"
import { useOtcOffers } from "@/modules/trade/otc/table/OtcTable.query"

export const useOtcHeaderData = () => {
  const { data, isLoading } = useOtcOffers()

  const [otcValue, { isLoading: isPriceLoading }] = useDisplayAssetsPrice(
    data?.map((otcOffer) => [otcOffer.assetOut.id, otcOffer.assetAmountOut]) ??
      [],
  )

  return {
    otcValue,
    isLoading: isLoading || isPriceLoading,
  }
}

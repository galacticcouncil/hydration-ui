export const useOtcHeaderData = () => {
  // const { data, isLoading } = useOtcOffers()

  // const [otcValue, { isLoading: isPriceLoading }] = useDisplayAssetsPrice(
  //   data?.map((otcOffer) => [otcOffer.assetOut.id, otcOffer.assetAmountOut]) ??
  //     [],
  // )

  return {
    otcValue: "0",
    isLoading: false,
  }
}

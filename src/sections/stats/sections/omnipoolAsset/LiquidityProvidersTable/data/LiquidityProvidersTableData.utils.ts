import BN from "bignumber.js"

export const useLiquidityProvidersTableData = () => {
  /* const apiIds = useApiIds()
  const uniques = useUniquesAsset(
    apiIds.data?.omnipoolCollectionId ?? "",
    withoutRefresh,
  )*/

  const data = [
    {
      account: "12313213133134434343",
      position: "3.845 DOT+0.09876 LRNA",
      tvl: BN(23232),
      share: BN(12),
    },
    {
      account: "12313213133134434343",
      position: "3.845 DOT+0.09876 LRNA",
      tvl: BN(23232),
      share: BN(12),
    },
    {
      account: "12313213133134434343",
      position: "3.845 DOT+0.09876 LRNA",
      tvl: BN(23232),
      share: BN(12),
    },
    {
      account: "12313213133134434343",
      position: "3.845 DOT+0.09876 LRNA",
      tvl: BN(23232),
      share: BN(12),
    },
    {
      account: "12313213133134434343",
      position: "3.845 DOT+0.09876 LRNA",
      tvl: BN(23232),
      share: BN(12),
    },
  ]

  return { isLoading: false, data }
}

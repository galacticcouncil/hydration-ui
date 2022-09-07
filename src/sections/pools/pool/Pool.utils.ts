import { useAssetMeta } from "api/assetMeta"
import { useAssetDetails } from "api/assetDetails"
import { useMemo } from "react"
import { BN_0, BN_1, BN_10, BN_12, BN_2, DOLLAR_RATES } from "utils/constants"
import { useTotalLiquidity } from "api/totalLiquidity"
import { useExchangeFee } from "api/exchangeFee"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"

type Props = {
  id: AccountId32
  assetA: string
  assetB: string
}

export const usePoolData = ({ id, assetA, assetB }: Props) => {
  const assetAMeta = useAssetMeta(assetA)
  const assetBMeta = useAssetMeta(assetB)

  const assetADetails = useAssetDetails(assetA)
  const assetBDetails = useAssetDetails(assetB)

  const exchangeFee = useExchangeFee()

  const total = useTotalLiquidity(id)

  const queries = [
    assetAMeta,
    assetBMeta,
    assetADetails,
    assetBDetails,
    exchangeFee,
    total,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (isLoading) return undefined

    const assetA = { meta: assetAMeta.data, details: assetADetails.data }
    const assetB = { meta: assetBMeta.data, details: assetBDetails.data }

    // TODO: calculate this correctly, this is just an example
    // calculate total liquidity inside pool
    const base = total.data?.div(BN_10.pow(BN_12))
    const half = base?.div(BN_2)

    const rateA = DOLLAR_RATES.get(assetA.details?.name ?? "")
    const totalA = half?.times(rateA ?? BN_1)

    const rateB = DOLLAR_RATES.get(assetB.details?.name ?? "")
    const totalB = half?.times(rateB ?? BN_1)

    const totalLiquidity = totalA?.plus(totalB ?? BN_0)?.toFixed()

    const tradingFee = exchangeFee.data

    return { assetA, assetB, tradingFee, totalLiquidity }
  }, [isLoading])

  return { data, isLoading }
}

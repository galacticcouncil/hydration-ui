import { useAssetMeta } from "api/assetMeta"
import { useAssetDetails } from "api/assetDetails"
import { useMemo } from "react"
import { AUSD_NAME, BN_0, TRADING_FEE } from "utils/constants"
import { useExchangeFee } from "api/exchangeFee"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { u32 } from "@polkadot/types"
import { useTokenBalance } from "api/balances"
import { getBalanceAmount } from "utils/balance"
import { useSpotPrice } from "api/spotPrice"
import { useAssets } from "api/asset"

type Props = {
  id: AccountId32
  assetA: u32
  assetB: u32
}

export const usePoolData = ({ id, assetA, assetB }: Props) => {
  const assets = useAssets()
  const aUSD = assets.data?.find(
    (a) => a.symbol.toLowerCase() === AUSD_NAME.toLowerCase(),
  )?.token

  const assetAMeta = useAssetMeta(assetA)
  const assetBMeta = useAssetMeta(assetB)

  const assetADetails = useAssetDetails(assetA)
  const assetBDetails = useAssetDetails(assetB)

  const assetABalance = useTokenBalance(assetA, id)
  const assetBBalance = useTokenBalance(assetB, id)

  const spotAtoAUSD = useSpotPrice(assetA, aUSD)
  const spotBtoAUSD = useSpotPrice(assetB, aUSD)

  const exchangeFee = useExchangeFee()

  const queries = [
    assets,
    assetAMeta,
    assetBMeta,
    assetADetails,
    assetBDetails,
    assetABalance,
    assetBBalance,
    spotAtoAUSD,
    spotBtoAUSD,
    exchangeFee,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (queries.some((q) => !q.data)) return undefined

    const assetA = {
      meta: assetAMeta.data?.data,
      details: assetADetails.data,
      balance: assetABalance.data?.balance,
    }
    const assetB = {
      meta: assetBMeta.data?.data,
      details: assetBDetails.data,
      balance: assetBBalance.data,
    }

    const balanceA = getBalanceAmount(
      assetABalance.data?.balance ?? BN_0,
      assetAMeta.data?.data.decimals.toNumber(),
    )
    const balanceB = getBalanceAmount(
      assetBBalance.data?.balance ?? BN_0,
      assetBMeta.data?.data.decimals.toNumber(),
    )

    const tradingFee = exchangeFee.data ?? TRADING_FEE

    const AtoAUSD = spotAtoAUSD.data?.spotPrice
    const BtoAUSD = spotBtoAUSD.data?.spotPrice

    const totalA = balanceA.times(AtoAUSD ?? BN_0)
    const totalB = balanceB.times(BtoAUSD ?? BN_0)
    const totalValue = totalA.plus(totalB)

    // const a = assetA.details?.name
    // const b = assetB.details?.name
    // console.table([
    //   [`Balance ${a}`, balanceA.toFixed()],
    //   [`Balance ${b}`, balanceB.toFixed()],
    //   [`Spot price: ${a} -> AUSD`, AtoAUSD?.toFixed()],
    //   [`Spot price: ${b} -> AUSD`, BtoAUSD?.toFixed()],
    //   [`Total ${a}`, totalA.toFixed()],
    //   [`Total ${b}`, totalB.toFixed()],
    //   [`Total`, totalValue.toFixed()],
    // ])

    return { assetA, assetB, tradingFee, totalValue }
  }, [
    assetAMeta.data,
    assetBMeta.data,
    assetADetails.data,
    assetBDetails.data,
    assetABalance.data,
    assetBBalance.data,
    spotAtoAUSD.data,
    spotBtoAUSD.data,
    exchangeFee.data,
    isLoading,
  ])

  return { data, isLoading }
}

import { useAssetMeta } from "api/assetMeta"
import { useAssetDetails } from "api/assetDetails"
import { useMemo } from "react"
import { BN_0, BN_1, DOLLAR_RATES } from "utils/constants"
import { useTotalLiquidity } from "api/totalLiquidity"
import { useExchangeFee } from "api/exchangeFee"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { u32 } from "@polkadot/types"
import { useTokenBalance } from "api/balances"
import { getBalanceAmount } from "utils/balance"

type Props = {
  id: AccountId32
  assetA: u32
  assetB: u32
}

export const usePoolData = ({ id, assetA, assetB }: Props) => {
  const assetAMeta = useAssetMeta(assetA)
  const assetBMeta = useAssetMeta(assetB)

  const assetADetails = useAssetDetails(assetA)
  const assetBDetails = useAssetDetails(assetB)

  const assetABalance = useTokenBalance(assetA, id.toHuman())
  const assetBBalance = useTokenBalance(assetB, id.toHuman())

  const exchangeFee = useExchangeFee()

  const total = useTotalLiquidity(id)

  const queries = [
    assetAMeta,
    assetBMeta,
    assetADetails,
    assetBDetails,
    assetABalance,
    assetBBalance,
    exchangeFee,
    total,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (isLoading) return undefined

    const assetA = {
      meta: assetAMeta.data,
      details: assetADetails.data,
      balance: assetABalance.data,
    }
    const assetB = {
      meta: assetBMeta.data,
      details: assetBDetails.data,
      balance: assetBBalance.data,
    }

    const balanceA = getBalanceAmount(
      assetABalance.data ?? BN_0,
      assetAMeta.data?.decimals,
    )
    const balanceB = getBalanceAmount(
      assetBBalance.data ?? BN_0,
      assetBMeta.data?.decimals,
    )

    const rateA = DOLLAR_RATES.get(assetA.details?.name ?? "")
    const rateB = DOLLAR_RATES.get(assetB.details?.name ?? "")

    const totalA = balanceA?.times(rateA ?? BN_1)
    const totalB = balanceB?.times(rateB ?? BN_1)

    const totalValue = totalA?.plus(totalB ?? BN_0)

    const tradingFee = exchangeFee.data

    return { assetA, assetB, tradingFee, totalValue }
  }, [
    assetABalance.data,
    assetADetails.data,
    assetAMeta.data,
    assetBBalance.data,
    assetBDetails.data,
    assetBMeta.data,
    exchangeFee.data,
    isLoading,
  ])

  return { data, isLoading }
}

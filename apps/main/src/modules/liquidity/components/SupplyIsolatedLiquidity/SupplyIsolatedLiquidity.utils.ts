import {
  ExtendedFormattedUser,
  getAssetCapData,
} from "@galacticcouncil/money-market/hooks"
import { PRIME_APY } from "@galacticcouncil/money-market/ui-config"
import { getAssetCollateralType } from "@galacticcouncil/money-market/utils"
import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"

import { healthFactorQuery } from "@/api/aave"
import { TAssetData, TErc20 } from "@/api/assets"
import { bestSellWithTxQuery } from "@/api/trade"
import { useMinimumTradeAmount } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export type TSupplyIsolatedLiquidityFormValues = {
  amount: string
  asset: TAssetData
}

export const useSupplyIsolatedLiquidity = ({
  supplyAssetId,
  initialAsset,
  aToken,
  userBorrowData,
}: {
  supplyAssetId: string
  initialAsset: TAssetData
  aToken: TErc20
  userBorrowData: ExtendedFormattedUser
}) => {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const form = useSupplyIsolatedLiquidityForm({ asset: initialAsset })
  const getMinimumTradeAmount = useMinimumTradeAmount()

  const supplyAssetAddress = getAddressFromAssetId(supplyAssetId)

  const userReserve = userBorrowData.userReservesData.find(
    (reserve) => reserve.underlyingAsset === supplyAssetAddress,
  )

  const assetCap = userReserve
    ? getAssetCapData(userReserve.reserve)
    : undefined
  const [amountIn, assetIn] = form.watch(["amount", "asset"])

  const [debouncedAmountIn] = useDebounce(amountIn, 300)

  const { data: trade } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: assetIn.id,
      assetOut: aToken.id,
      amountIn: debouncedAmountIn,
      slippage: swapSlippage,
      address: account?.address ?? "",
    }),
  )

  const minReceiveAmount = getMinimumTradeAmount(trade?.swap)?.toString() ?? "0"

  const { data: healthFactor } = useQuery(
    healthFactorQuery(rpc, {
      address: account?.address ?? "",
      fromAsset: assetIn,
      fromAmount: debouncedAmountIn,
      toAsset: aToken,
      toAmount: minReceiveAmount,
    }),
  )

  const collateralType =
    userReserve && assetCap
      ? getAssetCollateralType(
          userReserve,
          userBorrowData.totalCollateralUSD,
          userBorrowData.isInIsolationMode,
          assetCap.debtCeiling.isMaxed,
        )
      : undefined

  const onSubmit = (data: TSupplyIsolatedLiquidityFormValues) => {
    console.log(data)
  }

  const supplyAPR = PRIME_APY
  console.log(healthFactor)

  return {
    form,
    onSubmit,
    supplyAPR,
    collateralType,
    healthFactor,
  }
}

const useSupplyIsolatedLiquidityForm = ({ asset }: { asset: TAssetData }) => {
  return useForm<TSupplyIsolatedLiquidityFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset,
    },
  })
}

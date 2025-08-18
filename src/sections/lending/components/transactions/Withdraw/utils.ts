import { ProtocolAction } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { UseBaseQueryOptions, useQuery } from "@tanstack/react-query"
import { transformEvmTxToExtrinsic } from "api/evm"
import { useBestTradeSell } from "api/trade"
import BigNumber from "bignumber.js"
import { parseUnits } from "ethers/lib/utils"
import { useRpcProvider } from "providers/rpcProvider"
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { AAVE_EXTRA_GAS } from "utils/constants"
import { getAssetIdFromAddress } from "utils/evm"
import { QUERY_KEYS } from "utils/queryKeys"

export const calculateMaxWithdrawAmount = (
  user: ExtendedFormattedUser,
  userReserve: ComputedUserReserveData,
  poolReserve: ComputedReserveData,
) => {
  const underlyingBalance = valueToBigNumber(
    userReserve?.underlyingBalance || "0",
  )
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity)
  let maxAmountToWithdraw = BigNumber.min(
    underlyingBalance,
    unborrowedLiquidity,
  )
  let maxCollateralToWithdrawInETH = valueToBigNumber("0")
  const reserveLiquidationThreshold =
    user.isInEmode && user.userEmodeCategoryId === poolReserve.eModeCategoryId
      ? poolReserve.formattedEModeLiquidationThreshold
      : poolReserve.formattedReserveLiquidationThreshold
  if (
    userReserve?.usageAsCollateralEnabledOnUser &&
    poolReserve.reserveLiquidationThreshold !== "0" &&
    user.totalBorrowsMarketReferenceCurrency !== "0"
  ) {
    // if we have any borrowings we should check how much we can withdraw to a minimum HF of 1.01
    const excessHF = valueToBigNumber(user.healthFactor).minus("1.01")
    if (excessHF.gt("0")) {
      maxCollateralToWithdrawInETH = excessHF
        .multipliedBy(user.totalBorrowsMarketReferenceCurrency)
        .div(reserveLiquidationThreshold)
    }
    maxAmountToWithdraw = BigNumber.min(
      maxAmountToWithdraw,
      maxCollateralToWithdrawInETH.dividedBy(
        poolReserve.formattedPriceInMarketReferenceCurrency,
      ),
    )
  }

  return maxAmountToWithdraw
}

export const useWithdrawAndSellAll = (
  reserveAddress: string,
  aTokenAddress: string,
  assetReceivedId: string,
  amount: string,
  options: UseBaseQueryOptions = {},
) => {
  const { api } = useRpcProvider()
  const [withdraw, estimateGasLimit] = useRootStore((state) => [
    state.withdraw,
    state.estimateGasLimit,
  ])

  const { getSwapTx, isLoading: isLoadingSell } = useBestTradeSell(
    getAssetIdFromAddress(reserveAddress),
    assetReceivedId,
    amount,
  )

  return useQuery({
    enabled: (options.enabled ?? true) && !!amount && !isLoadingSell,
    queryKey: QUERY_KEYS.moneyMarketMaxWithdraw(
      reserveAddress,
      assetReceivedId,
      amount,
    ),
    queryFn: async () => {
      const config = await withdraw({
        reserve: reserveAddress,
        amount: "-1", // Withdraw all
        aTokenAddress,
      })

      const params = await config.find((tx) => tx.txType === "DLP_ACTION")?.tx()
      const withdrawTx = params
        ? await estimateGasLimit(
            {
              ...params,
              value: parseUnits("0"),
            },
            ProtocolAction.withdraw,
          )
        : null

      const swapTx = await getSwapTx()

      if (!withdrawTx || !swapTx) {
        throw new Error("Transaction invalid")
      }

      const withdrawEvmTx = api.tx.dispatcher.dispatchEvmCall(
        transformEvmTxToExtrinsic(api, withdrawTx),
      )

      return api.tx.utility.batchAll([
        api.tx.dispatcher.dispatchWithExtraGas(withdrawEvmTx, AAVE_EXTRA_GAS),
        swapTx,
      ])
    },
  })
}

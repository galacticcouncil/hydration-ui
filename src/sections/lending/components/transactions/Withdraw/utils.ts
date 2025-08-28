import { valueToBigNumber } from "@aave/math-utils"
import { useMutation } from "@tanstack/react-query"
import { useBorrowWithdraw } from "api/borrow"
import { useTransformEvmTxToExtrinsic } from "api/evm"
import { useBestTradeSell } from "api/trade"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import {
  ComputedReserveData,
  ComputedUserReserveData,
  ExtendedFormattedUser,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AAVE_EXTRA_GAS } from "utils/constants"
import { getAssetIdFromAddress } from "utils/evm"

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
) => {
  const { api } = useRpcProvider()
  const withdraw = useBorrowWithdraw()
  const transformTx = useTransformEvmTxToExtrinsic()

  const { getSwapTx } = useBestTradeSell(
    getAssetIdFromAddress(reserveAddress),
    assetReceivedId,
    amount,
  )

  return useMutation({
    mutationFn: async () => {
      if (!withdraw) return
      const withdrawTx = await withdraw({
        reserve: reserveAddress,
        amount: "-1", // Withdraw all
        aTokenAddress,
      })

      const swapTx = await getSwapTx()

      if (!withdrawTx || !swapTx) {
        throw new Error("Transaction invalid")
      }

      const withdrawEvmTx = api.tx.dispatcher.dispatchEvmCall(
        transformTx(withdrawTx),
      )

      return api.tx.utility.batchAll([
        api.tx.dispatcher.dispatchWithExtraGas(withdrawEvmTx, AAVE_EXTRA_GAS),
        swapTx,
      ])
    },
  })
}

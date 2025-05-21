import Big from "big.js"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useModalContext } from "@/hooks/useModal"

enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

interface WithdrawErrorProps {
  assetsBlockingWithdraw: string[]
  poolReserve: ComputedReserveData
  healthFactorAfterWithdraw: Big
  withdrawAmount: string
}
export const useWithdrawError = ({
  assetsBlockingWithdraw,
  poolReserve,
  healthFactorAfterWithdraw,
  withdrawAmount,
}: WithdrawErrorProps) => {
  const { mainTxState: withdrawTxState } = useModalContext()
  const { user } = useAppDataContext()

  let blockingError: ErrorType | undefined = undefined
  const unborrowedLiquidity = Big(poolReserve.unborrowedLiquidity)

  if (!withdrawTxState.success && !withdrawTxState.txHash) {
    if (
      assetsBlockingWithdraw.length > 0 &&
      !assetsBlockingWithdraw.includes(poolReserve.symbol)
    ) {
      blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED
    } else if (
      healthFactorAfterWithdraw.lt("1") &&
      user.totalBorrowsMarketReferenceCurrency !== "0"
    ) {
      blockingError = ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT
    } else if (
      !blockingError &&
      (unborrowedLiquidity.eq("0") ||
        Big(withdrawAmount || "0").gt(poolReserve.unborrowedLiquidity))
    ) {
      blockingError = ErrorType.POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY
    }
  }

  const errors = {
    [ErrorType.CAN_NOT_WITHDRAW_THIS_AMOUNT]:
      "You can not withdraw this amount because it will cause collateral call",
    [ErrorType.POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY]:
      "These funds have been borrowed and are not available for withdrawal at this time.",
    [ErrorType.ZERO_LTV_WITHDRAW_BLOCKED]: `Assets with zero LTV (${assetsBlockingWithdraw}) must be withdrawn or disabled as collateral to perform this action`,
  }

  return {
    blockingError,
    errorText: blockingError ? errors[blockingError] : undefined,
  }
}

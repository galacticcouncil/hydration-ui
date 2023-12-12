import { usePaymentInfo } from "api/transaction"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { BN_0 } from "utils/constants"

export type TransferMethod = "transfer" | "transferKeepAlive"

export function usePaymentFees({
  asset,
  currentAmount,
  maxAmount,
}: {
  asset: string
  currentAmount: BN
  maxAmount: BN
}) {
  const { api, assets } = useRpcProvider()

  const formattedCurrentAmount = !currentAmount?.isNaN()
    ? currentAmount.toString()
    : "0"

  const { data: currentData } = usePaymentInfo(
    asset.toString() === assets.native.id
      ? api.tx.balances.transferKeepAlive("", formattedCurrentAmount)
      : api.tx.tokens.transferKeepAlive("", asset, formattedCurrentAmount),
  )

  const formattedMaxAmount = !maxAmount?.isNaN() ? maxAmount.toString() : "0"

  const { data: maxData } = usePaymentInfo(
    asset.toString() === assets.native.id
      ? api.tx.balances.transfer("", formattedMaxAmount)
      : api.tx.tokens.transfer("", asset, formattedMaxAmount),
  )

  return {
    currentFee: currentData?.partialFee.toBigNumber() ?? BN_0,
    maxFee: maxData?.partialFee.toBigNumber() ?? BN_0,
  }
}

import { isNumber } from "remeda"

import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/types"

export type XcSwapQuoteParams = {
  assetIn: number
  amountIn: bigint
  destinationAsset: string
  recipient: string
  refundTo: string
  slippage: number
}

type AssertXcSwapQuoteParamsInput = {
  srcAsset: XcAsset | null | undefined
  amountIn: bigint | null
  destAsset: XcAsset | null | undefined
  recipient: string | null | undefined
  refundTo: string | null
  slippage: number
}

export const assertXcSwapQuoteParams = ({
  srcAsset,
  amountIn,
  destAsset,
  recipient,
  refundTo,
  slippage,
}: AssertXcSwapQuoteParamsInput): XcSwapQuoteParams => {
  if (!isNumber(srcAsset?.id)) throw new Error("Source asset is required")
  if (amountIn === null || amountIn <= 0n) {
    throw new Error("Amount in is required")
  }
  if (!destAsset?.oneClickId) throw new Error("Destination asset is required")
  if (!recipient) throw new Error("Recipient is required")
  if (!refundTo) throw new Error("Refund address is required")

  return {
    assetIn: srcAsset.id,
    amountIn,
    destinationAsset: destAsset.oneClickId,
    recipient,
    refundTo,
    slippage,
  }
}

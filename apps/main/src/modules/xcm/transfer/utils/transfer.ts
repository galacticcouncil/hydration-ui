import { Asset } from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
import Big from "big.js"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { toDecimal } from "@/utils/formatting"

export enum XcmTransferStatus {
  Default = "DEFAULT",
  TransferInvalid = "TRANSFER_INVALID",
  RecipientMissing = "RECIPIENT_MISSING",
  AmountMissing = "AMOUNT_MISSING",
  InsufficientBalance = "INSUFFICIENT_BALANCE",
}

export const getTransferStatus = (
  values: XcmFormValues,
  transfer: Transfer | null,
) => {
  switch (true) {
    case !values.destAddress:
      return XcmTransferStatus.RecipientMissing
    case !!transfer && transfer.source.balance.amount === 0n:
    case !!transfer && transfer.source.min.amount >= transfer.source.max.amount:
      return XcmTransferStatus.InsufficientBalance
    case !values.srcAmount:
      return XcmTransferStatus.AmountMissing
    default:
      return XcmTransferStatus.Default
  }
}

export const calculateTransferDestAmount = (
  asset: Asset,
  amount: string,
  transfer: Transfer,
): string => {
  const { destinationFee } = transfer.source
  if (asset.isEqual(destinationFee)) {
    const destFee = toDecimal(destinationFee.amount, destinationFee.decimals)
    const amountMinusFee = Big(amount || "0").minus(destFee)
    return amountMinusFee.gt(0) ? amountMinusFee.toString() : ""
  }

  return amount
}

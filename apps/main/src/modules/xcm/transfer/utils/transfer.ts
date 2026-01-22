import { Asset, AssetRoute } from "@galacticcouncil/xc-core"
import { Call, Transfer } from "@galacticcouncil/xc-sdk"
import Big from "big.js"

import { isEvmApproveCall } from "@/modules/transactions/utils/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XCM_BRIDGE_TAGS, XcmTags } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export enum XcmTransferStatus {
  Default = "DEFAULT",
  TransferValid = "TRANSFER_VALID",
  ApproveAndTransferValid = "APPROVE_AND_TRANSFER_VALID",
  TransferInvalid = "TRANSFER_INVALID",
  RecipientMissing = "RECIPIENT_MISSING",
  AmountMissing = "AMOUNT_MISSING",
  InsufficientBalance = "INSUFFICIENT_BALANCE",
}

export const getTransferStatus = (
  values: XcmFormValues,
  transfer: Transfer | null,
  call: Call | null,
  alerts: XcmAlert[],
) => {
  switch (true) {
    case !values.destAddress:
      return XcmTransferStatus.RecipientMissing
    case !!transfer && transfer.source.balance.amount === 0n:
    case !!transfer && transfer.source.min.amount >= transfer.source.max.amount:
      return XcmTransferStatus.InsufficientBalance
    case !values.srcAmount:
      return XcmTransferStatus.AmountMissing
    case alerts.length > 0:
      return XcmTransferStatus.TransferInvalid
    case !!call && isEvmApproveCall(call):
      return XcmTransferStatus.ApproveAndTransferValid
    case !!transfer && !!call && alerts.length === 0:
      return XcmTransferStatus.TransferValid
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

export const isBridgeAssetRoute = (route: AssetRoute | null): boolean => {
  const tags = (route?.tags ?? []) as XcmTags
  return tags.some((tag) => XCM_BRIDGE_TAGS.includes(tag))
}

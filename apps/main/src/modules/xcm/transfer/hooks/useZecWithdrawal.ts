import { isAddressValidOnChain, isValidBigSource } from "@galacticcouncil/utils"
import { ZEC_DECIMALS } from "@galacticcouncil/xc-sdk"
import { withdrawZec, XcSwapError } from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"
import { useTranslation } from "react-i18next"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import {
  isNearAccount,
  isZecWithdrawal,
  ZEC_WITHDRAWAL_QUOTE_ACCOUNT,
} from "@/modules/xcm/transfer/utils/zecWithdrawal"
import { toBigInt, toDecimal } from "@/utils/formatting"

/** 1Click's estimate of a zcash withdrawal, and its form alerts. */
export const useZecWithdrawal = (values: XcmFormValues) => {
  const { t } = useTranslation("xcm")
  const { srcChain, srcAsset, destChain, srcAmount, destAddress, nearAccount } =
    values

  const isWithdrawal = isZecWithdrawal(srcChain, srcAsset, destChain)
  const amount =
    isWithdrawal && isValidBigSource(srcAmount)
      ? toBigInt(srcAmount, ZEC_DECIMALS)
      : 0n
  const recipient =
    destChain && isAddressValidOnChain(destAddress, destChain)
      ? destAddress
      : ""
  const hasNearAccount = isNearAccount(nearAccount)
  const refundTo = hasNearAccount
    ? (nearAccount ?? "")
    : ZEC_WITHDRAWAL_QUOTE_ACCOUNT

  const { data, isLoading } = useQuery({
    queryKey: ["xcm", "zecWithdrawal", amount.toString(), recipient, refundTo],
    queryFn: () => withdrawZec({ from: refundTo, amount, recipient }),
    enabled: isWithdrawal && amount > 0n && !!recipient,
    staleTime: secondsToMilliseconds(30),
  })

  const errorMessage = (error: XcSwapError) => {
    switch (error) {
      case XcSwapError.AmountTooLow:
        return t("zecWithdrawal.alert.amountTooLow")
      case XcSwapError.RecipientInvalid:
        return t("zecWithdrawal.alert.recipientInvalid")
      default:
        return t("zecWithdrawal.alert.quoteFailed")
    }
  }

  const alerts: XcmAlert[] = isWithdrawal
    ? [
        {
          key: "zecWithdrawal.claim",
          severity: "info",
          message: t("zecWithdrawal.alert.claim"),
        },
        ...(hasNearAccount
          ? []
          : [
              {
                key: "zecWithdrawal.nearAccount",
                severity: "error" as const,
                message: t("zecWithdrawal.alert.nearAccount"),
              },
            ]),
        ...(data?.errors ?? []).map((error) => ({
          key: `zecWithdrawal.${error}`,
          severity: "error" as const,
          message: errorMessage(error),
        })),
      ]
    : []

  return {
    isWithdrawal,
    isLoading: isWithdrawal && isLoading,
    alerts,
    destAmount: data?.amountOut ? toDecimal(data.amountOut, ZEC_DECIMALS) : "",
    fee: data?.fee,
  }
}

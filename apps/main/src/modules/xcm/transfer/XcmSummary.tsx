import {
  CollapsibleContent,
  CollapsibleRoot,
  Separator,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { isAnyEvmChain } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { Children, FC, ReactNode } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { xcmDestinationFeeQuery } from "@/api/xcm"
import { isEvmApproveCall } from "@/modules/transactions/utils/xcm"
import { useEvmApprovalFee } from "@/modules/xcm/transfer/hooks/useEvmApprovalFee"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransferConfigs } from "@/modules/xcm/transfer/hooks/useXcmTransferConfigs"
import {
  isOmniRoute,
  isSnowbridgeRoute,
} from "@/modules/xcm/transfer/utils/bridge"
import { toDecimal } from "@/utils/formatting"

type XcmSummaryProps = {
  children?: ReactNode
  withFeeContext?: boolean
  hideUnavailable?: boolean
}

export const XcmSummary: FC<XcmSummaryProps> = ({
  children,
  withFeeContext = false,
  hideUnavailable = false,
}) => {
  const { t } = useTranslation(["common", "xcm", "onramp"])
  const { transfer, call, alerts, isLoading, isLoadingTransfer, transferArgs } =
    useXcmProvider()

  const { formState, watch } = useFormContext<XcmFormValues>()

  const { source, destination } = transfer || {}

  const [srcAsset, destAsset, srcChain, destChain, bridgeProvider, srcAmount] =
    watch([
      "srcAsset",
      "destAsset",
      "srcChain",
      "destChain",
      "bridgeProvider",
      "srcAmount",
    ])

  const config = useXcmTransferConfigs(
    srcAsset,
    srcChain,
    destChain,
    destAsset,
    bridgeProvider,
  )
  const { origin } = config ?? {}

  const isSnowbridge = !!origin?.route && isSnowbridgeRoute(origin.route)
  // Omni's cut of a withdrawal to Zcash, out of what lands
  const isOmniWithdrawal =
    !!origin?.route && isOmniRoute(origin.route) && !!destChain?.isZec()
  const isDestFeeAmountBound = isSnowbridge || isOmniWithdrawal

  const {
    data: amountDestFee,
    isLoading: isLoadingDestFee,
    isFetching: isFetchingDestFee,
    isPlaceholderData: isDestFeePlaceholder,
    isError: isDestFeeError,
  } = useQuery(
    xcmDestinationFeeQuery(
      isDestFeeAmountBound ? transfer : null,
      srcAmount,
      transferArgs,
    ),
  )

  // Snowbridge V2 and Omni withdrawal fees are volume-based — read the
  // amount-aware value from the query instead of the build-time snapshot.
  const effectiveDestFee = isDestFeeAmountBound
    ? isDestFeePlaceholder || isDestFeeError
      ? undefined
      : amountDestFee
    : destination?.fee

  const sourceFeeValue = (() => {
    if (!source)
      return withFeeContext && !hideUnavailable
        ? t("xcm:summary.feeEstimationNotAvailable")
        : null
    if (source.fee.amount === 0n)
      return hideUnavailable ? null : t("xcm:summary.feeEstimationNotAvailable")
    return t("currency", {
      value: toDecimal(source.fee.amount, source.fee.decimals),
      symbol: source.fee.originSymbol,
    })
  })()

  const destFeeLabel = (() => {
    if (isOmniWithdrawal) return t("xcm:summary.withdrawalFee")
    if (!origin?.route) return t("xcm:summary.destinationFee")
    if (isSnowbridge) return t("xcm:summary.bridgeFee")
    return t("xcm:summary.destinationFee")
  })()

  const destFeeValue = (() => {
    if (!effectiveDestFee)
      return withFeeContext && !hideUnavailable
        ? t("xcm:summary.feeEstimationNotAvailable")
        : null
    if (effectiveDestFee.amount === 0n)
      return t("xcm:summary.destinationFee.free")
    return t("currency", {
      value: toDecimal(effectiveDestFee.amount, effectiveDestFee.decimals),
      symbol: effectiveDestFee.originSymbol,
    })
  })()

  const {
    data: approvalFee,
    isLoading: isLoadingApprovalFee,
    isFetching: isFetchingApprovalFee,
    isPlaceholderData: isApprovalFeePlaceholder,
    isError: isApprovalFeeError,
  } = useEvmApprovalFee(call)

  const isEvmSourceChain = !!srcChain && isAnyEvmChain(srcChain)

  const approvalFeeValue = (() => {
    if (
      approvalFee === null ||
      approvalFee === undefined ||
      !isEvmSourceChain ||
      isApprovalFeePlaceholder ||
      isApprovalFeeError
    )
      return withFeeContext && !hideUnavailable
        ? t("xcm:summary.feeEstimationNotAvailable")
        : null
    return t("currency", {
      value: toDecimal(approvalFee, srcChain.evmChain.nativeCurrency.decimals),
      symbol: srcChain.evmChain.nativeCurrency.symbol,
    })
  })()

  const hasErrorAlerts = alerts.some((a) => a.severity === "error")
  const isTransferValid = !!transfer && formState.isValid && !hasErrorAlerts
  const isLoadingFees = hideUnavailable ? isLoadingTransfer : isLoading
  const isLoadingApproval =
    isLoadingFees ||
    (!isApprovalFeeError &&
      (isLoadingApprovalFee ||
        (isApprovalFeePlaceholder && isFetchingApprovalFee)))
  const isLoadingDestination =
    isLoadingFees ||
    (isDestFeeAmountBound &&
      !isDestFeeError &&
      (isLoadingDestFee || (isDestFeePlaceholder && isFetchingDestFee)))
  const showApprovalFee =
    call &&
    isEvmSourceChain &&
    isEvmApproveCall(call) &&
    (!hideUnavailable || approvalFeeValue !== null || isLoadingApproval)
  const showSourceFee =
    !hideUnavailable || sourceFeeValue !== null || isLoadingFees
  const showDestinationFee =
    !hideUnavailable || destFeeValue !== null || isLoadingDestination

  if (
    !showApprovalFee &&
    !showSourceFee &&
    !showDestinationFee &&
    Children.toArray(children).length === 0
  ) {
    return null
  }

  return (
    <CollapsibleRoot open={isTransferValid}>
      <CollapsibleContent>
        <Summary
          separator={<Separator mx="-xl" />}
          px="xl"
          withLeadingSeparator
        >
          {showApprovalFee && (
            <SummaryRow
              label={
                withFeeContext
                  ? t("onramp:transferSummary.approvalFeeIncluded")
                  : t("xcm:summary.approvalFee")
              }
              loading={isLoadingApproval}
              content={approvalFeeValue}
            />
          )}
          {showSourceFee && (
            <SummaryRow
              label={t("xcm:summary.sourceFee")}
              loading={isLoadingFees}
              content={sourceFeeValue}
            />
          )}
          {showDestinationFee && (
            <SummaryRow
              label={destFeeLabel}
              loading={isLoadingDestination}
              content={destFeeValue}
            />
          )}
          {children}
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

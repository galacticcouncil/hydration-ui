import {
  Alert,
  CollapsibleContent,
  CollapsibleRoot,
  Separator,
  Stack,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { isAnyEvmChain } from "@galacticcouncil/utils"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { isEvmApproveCall } from "@/modules/transactions/utils/xcm"
import { useEvmApprovalFee } from "@/modules/xcm/transfer/hooks/useEvmApprovalFee"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransferConfigs } from "@/modules/xcm/transfer/hooks/useXcmTransferConfigs"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export const XcmSummary = () => {
  const { t } = useTranslation(["common", "xcm"])
  const { transfer, call, alerts, isLoading } = useXcmProvider()

  const { formState, watch } = useFormContext<XcmFormValues>()

  const { source, destination } = transfer || {}

  const [srcAsset, destAsset, srcChain, destChain] = watch([
    "srcAsset",
    "destAsset",
    "srcChain",
    "destChain",
  ])

  const config = useXcmTransferConfigs(srcAsset, srcChain, destChain, destAsset)
  const { origin } = config ?? {}

  const sourceFeeValue = (() => {
    if (!source) return null
    if (source.fee.amount === 0n)
      return t("xcm:summary.feeEstimationNotAvailable")
    return t("currency", {
      value: toDecimal(source.fee.amount, source.fee.decimals),
      symbol: source.fee.originSymbol,
    })
  })()

  const destFeeLabel = (() => {
    if (!origin?.route) return t("xcm:summary.destinationFee")
    if (origin.route.tags?.includes(XcmTag.Mrl))
      return t("xcm:summary.relayerFee")
    if (origin.route.tags?.includes(XcmTag.Snowbridge))
      return t("xcm:summary.bridgeFee")
    return t("xcm:summary.destinationFee")
  })()

  const destFeeValue = (() => {
    if (!destination) return null
    if (destination.fee.amount === 0n)
      return t("xcm:summary.destinationFee.free")
    return t("currency", {
      value: toDecimal(destination.fee.amount, destination.fee.decimals),
      symbol: destination.fee.originSymbol,
    })
  })()

  const { data: approvalFee, isLoading: isLoadingApprovalFee } =
    useEvmApprovalFee(call)

  const isEvmSourceChain = !!srcChain && isAnyEvmChain(srcChain)

  const approvalFeeValue = (() => {
    if (!approvalFee || !isEvmSourceChain) return null
    return t("currency", {
      value: toDecimal(approvalFee, srcChain.evmChain.nativeCurrency.decimals),
      symbol: srcChain.evmChain.nativeCurrency.symbol,
    })
  })()

  const isTransferValid =
    !!transfer && call && formState.isValid && !alerts.length
  const isSummaryOpen = isTransferValid || alerts.length > 0

  return (
    <CollapsibleRoot open={isSummaryOpen}>
      <CollapsibleContent>
        {alerts.length > 0 && (
          <>
            <Separator />
            <Stack gap="base" px="xl" my="xl">
              {alerts.map((alert) => (
                <Alert
                  variant="error"
                  key={alert.key}
                  description={alert.message}
                />
              ))}
            </Stack>
          </>
        )}
        {isTransferValid && (
          <Summary
            separator={<Separator mx="-xl" />}
            px="xl"
            withLeadingSeparator
          >
            {isEvmSourceChain && isEvmApproveCall(call) && (
              <SummaryRow
                label={t("xcm:summary.approvalFee")}
                loading={isLoading || isLoadingApprovalFee}
                content={approvalFeeValue}
              />
            )}
            <SummaryRow
              label={t("xcm:summary.sourceFee")}
              loading={isLoading}
              content={sourceFeeValue}
            />
            <SummaryRow
              label={destFeeLabel}
              loading={isLoading}
              content={destFeeValue}
            />
          </Summary>
        )}
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

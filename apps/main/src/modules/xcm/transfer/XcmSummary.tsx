import {
  CollapsibleContent,
  CollapsibleRoot,
  Separator,
  Summary,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useXcmTransferConfigs } from "@/modules/xcm/transfer/hooks/useXcmTransferConfigs"
import { XcmTag } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export const XcmSummary = () => {
  const { t } = useTranslation(["common", "xcm"])
  const { transfer, isLoading } = useXcmProvider()

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

  const isSummaryOpen = !!transfer && formState.isValid

  return (
    <CollapsibleRoot open={isSummaryOpen}>
      <CollapsibleContent>
        <Summary
          separator={<Separator mx={-20} />}
          px={20}
          withLeadingSeparator
        >
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
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

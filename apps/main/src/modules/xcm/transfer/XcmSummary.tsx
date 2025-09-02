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

export const XcmSummary = () => {
  const { t } = useTranslation(["common", "xcm"])
  const { transfer, isLoading } = useXcmProvider()

  const { formState } = useFormContext<XcmFormValues>()

  const { source, destination } = transfer || {}

  return (
    <CollapsibleRoot open={!!transfer && formState.isValid}>
      <CollapsibleContent>
        <Summary
          separator={<Separator mx={-20} />}
          px={20}
          withLeadingSeparator
        >
          <SummaryRow
            label={t("xcm:summary.sourceFee")}
            loading={isLoading}
            content={
              source
                ? t("currency", {
                    value: source.fee.toDecimal(source.fee.decimals),
                    symbol: source.fee.originSymbol,
                  })
                : "-"
            }
          />
          <SummaryRow
            label={t("xcm:summary.destinationFee")}
            loading={isLoading}
            content={
              destination
                ? t("currency", {
                    value: destination.fee.toDecimal(destination.fee.decimals),
                    symbol: destination.fee.originSymbol,
                  })
                : "-"
            }
          />
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

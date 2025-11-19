import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Separator,
  Summary,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { AssetRoute } from "@galacticcouncil/xcm-core"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useXcmProvider } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { XcmTag } from "@/states/transactions"

export const XcmSummary = ({
  routes,
  selectedRouteIndex,
  setSelectedRouteIndex,
}: {
  routes: AssetRoute[]
  selectedRouteIndex: number
  setSelectedRouteIndex: (index: number) => void
}) => {
  const { t } = useTranslation(["common", "xcm"])
  const { transfer, isLoading } = useXcmProvider()

  const { formState } = useFormContext<XcmFormValues>()

  const { source, destination } = transfer || {}

  return (
    <CollapsibleRoot open={!!transfer && formState.isValid}>
      <CollapsibleContent>
        {routes.length > 1 && (
          <Flex gap={10} px={20} mb={20}>
            {routes.map(({ tags }, index) => {
              const isSelected = selectedRouteIndex === index
              return (
                <Box
                  key={index}
                  px={14}
                  py={10}
                  borderRadius="lg"
                  onClick={() => setSelectedRouteIndex(index)}
                  sx={{
                    flex: 1,
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: isSelected
                      ? getToken("buttons.secondary.outline.outline")
                      : getToken("details.borders"),
                    backgroundColor: isSelected
                      ? getToken("buttons.secondary.outline.fill")
                      : "transparent",
                  }}
                >
                  <Text>
                    {tags?.includes(XcmTag.Snowbridge) && "Snowbridge"}
                    {tags?.includes(XcmTag.Wormhole) && "Wormhole"}
                  </Text>
                  <Flex justify="space-between">
                    <Text color={getToken("text.medium")} fs={12}>
                      Est. time
                    </Text>
                    <Text color={getToken("text.medium")} fs={12}>
                      ≈ 30min
                    </Text>
                  </Flex>
                </Box>
              )
            })}
          </Flex>
        )}
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

import { ChevronDown, ChevronUp } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Icon,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { MarketSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/MarketSummaryRow"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly label: string
  readonly tooltip: string
  readonly amount: ReactNode
  readonly isExpanded: boolean
  readonly onIsExpandedChange: (isExpanded: boolean) => void
}

export const CalculatedAmountSummaryRow: FC<Props> = ({
  label,
  tooltip,
  amount,
  isExpanded,
  onIsExpandedChange,
}) => {
  const { t } = useTranslation(["common", "trade"])

  const {
    swap: {
      single: { swapSlippage },
      split: { twapSlippage },
    },
  } = useTradeSettings()

  return (
    <MarketSummaryRow
      label={label}
      content={
        <Flex
          as="button"
          sx={{ cursor: "pointer" }}
          align="center"
          gap={10}
          onClick={(e) => {
            e.preventDefault()
            onIsExpandedChange(!isExpanded)
          }}
        >
          {typeof amount === "string" ? (
            <SummaryRowValue fw={600} fs="p4" lh={1.2}>
              {amount}
            </SummaryRowValue>
          ) : (
            amount
          )}
          <Icon
            component={isExpanded ? ChevronUp : ChevronDown}
            size={20}
            color={getToken("icons.onContainer")}
          />
        </Flex>
      }
      tooltip={
        <Flex direction="column" gap={8}>
          <Box>{tooltip}</Box>
          <Box>
            <Flex justify="space-between">
              <Box>
                {t("trade:market.summary.calculatedAmount.tooltip.single")}
              </Box>
              <Box>{t("percent", { value: swapSlippage })}</Box>
            </Flex>
            <Flex justify="space-between">
              <Box>
                {t("trade:market.summary.calculatedAmount.tooltip.split")}
              </Box>
              <Box>{t("percent", { value: twapSlippage })}</Box>
            </Flex>
          </Box>
        </Flex>
      }
    />
  )
}

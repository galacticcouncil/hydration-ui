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
  readonly amount: ReactNode
  readonly isCollapsed: boolean
  readonly onIsCollapsedChange: (isCollapsed: boolean) => void
}

export const CalculatedAmountSummaryRow: FC<Props> = ({
  label,
  amount,
  isCollapsed,
  onIsCollapsedChange,
}) => {
  const { t } = useTranslation(["trade"])

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
          sx={{ cursor: "pointer" }}
          align="center"
          gap={10}
          onClick={() => onIsCollapsedChange(!isCollapsed)}
        >
          {typeof amount === "string" ? (
            <SummaryRowValue fw={600} fs="p4" lh={1.2}>
              {amount}
            </SummaryRowValue>
          ) : (
            amount
          )}
          <Icon
            component={isCollapsed ? ChevronDown : ChevronUp}
            size={20}
            color={getToken("icons.onContainer")}
          />
        </Flex>
      }
      tooltip={
        <Flex direction="column" gap={8}>
          <Box>{t("trade:market.summary.maxSent.tooltip")}</Box>
          <Box>
            <Box>
              {t("trade:market.summary.calculatedAmount.tooltip.single", {
                amount: swapSlippage,
              })}
            </Box>
            <Box>
              {t("trade:market.summary.calculatedAmount.tooltip.split", {
                amount: twapSlippage,
              })}
            </Box>
          </Box>
        </Flex>
      }
    />
  )
}

import {
  Button,
  Flex,
  SummaryRow,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useSwapSlippageSettings } from "@/hooks/paraswap/useSwapRateProvider"

export const SwapSlippageSummaryRow: React.FC = () => {
  const { formatPercent } = useAppFormatters()
  const { swapSlippage, onSwapModalOpenChange } = useSwapSlippageSettings()

  return (
    <SummaryRow
      label="Slippage tolerance"
      content={
        <Flex align="center" gap="s">
          <SummaryRowValue color={getToken("text.tint.quart")}>
            {formatPercent(swapSlippage)}
          </SummaryRowValue>
          <Button
            size="micro"
            uppercase
            outline
            variant="accent"
            onClick={() => onSwapModalOpenChange(true)}
          >
            Edit
          </Button>
        </Flex>
      }
    />
  )
}

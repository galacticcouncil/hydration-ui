import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ReactNode } from "react"

const SLIPPAGE_VALUES = ["0.1", "0.5", "1"]

export type SlippageSelectorProps = {
  selectedSlippage: string
  setSlippage: (value: string) => void
  slippageTooltipHeader?: ReactNode
}

export const SlippageSelector = ({
  selectedSlippage,
  setSlippage,
  slippageTooltipHeader,
}: SlippageSelectorProps) => {
  return (
    <Flex align="center" justify="space-between" gap="s">
      <Tooltip
        text={
          <>
            {slippageTooltipHeader}
            Slippage tolerance is the maximum difference between the expected
            and the actual amount of tokens received. A higher value increases
            the likelihood of the swap succeeding, but may result in a worse
            price.
          </>
        }
      >
        <Flex align="center" gap="xs">
          <Text fs="p5" color={getToken("text.medium")}>
            Slippage tolerance
          </Text>
          <CircleInfo width={14} height={14} />
        </Flex>
      </Tooltip>
      <ToggleGroup<string>
        type="single"
        size="small"
        value={selectedSlippage}
        onValueChange={(value) => value && setSlippage(value)}
      >
        {SLIPPAGE_VALUES.map((value) => (
          <ToggleGroupItem key={value} value={value}>
            {value}%
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </Flex>
  )
}

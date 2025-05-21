import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  DynamicFeeRangeType,
  dynamicFeeRangeTypes,
  SFeeSection,
} from "@/components/DynamicFee/DynamicFee.styled"

type DynamicFeeProps = {
  readonly value: number
  readonly rangeLow: number
  readonly rangeHigh: number
  readonly tooltip?: string
  readonly displayValue?: boolean
}

export const DynamicFee = ({
  value,
  rangeLow,
  rangeHigh,
  tooltip,
  displayValue,
}: DynamicFeeProps) => {
  const { t } = useTranslation()

  const currentKey = ((): DynamicFeeRangeType | undefined => {
    switch (true) {
      case value > rangeHigh:
        return "high"
      case value >= rangeLow:
        return "middle"
      default:
        return "low"
    }
  })()

  return (
    <Flex gap={8} align="center">
      {displayValue && (
        <Text fs="p6" fw={500} color={getToken("text.high")}>
          {t("percent", { value })}
        </Text>
      )}
      <Flex p="1px 2px" gap={1} height="min-content">
        {dynamicFeeRangeTypes.map((rangeType) => {
          const isActive = rangeType === currentKey

          return (
            <SFeeSection key={rangeType} type={rangeType} isActive={isActive}>
              {isActive && <div />}
            </SFeeSection>
          )
        })}
      </Flex>
      {tooltip && <Tooltip text={tooltip} />}
    </Flex>
  )
}

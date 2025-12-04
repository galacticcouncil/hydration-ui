import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import {
  DynamicFeeRangeType,
  dynamicFeeRangeTypes,
  SFeeSection,
} from "@/components/DynamicFee/DynamicFee.styled"

type DynamicFeeProps = {
  readonly amount?: string
  readonly value: number
  readonly rangeLow: number
  readonly rangeHigh: number
}

export const DynamicFee = ({
  amount,
  value,
  rangeLow,
  rangeHigh,
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
      {amount ? (
        <Text fs="p5" fw={500} lh={1.2}>
          <span sx={{ color: getToken("text.high") }}>{amount}</span>{" "}
          <span sx={{ color: getToken("colors.skyBlue.500") }}>
            ({t("percent", { value })})
          </span>
        </Text>
      ) : (
        <Text fs="p5" fw={500} lh={1.2} color={getToken("text.high")}>
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
    </Flex>
  )
}

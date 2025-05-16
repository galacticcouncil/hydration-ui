import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { SFeeSection } from "./DynamicFee.styled"

const rangeTypes = ["low", "middle", "high"] as const
export type RangeType = (typeof rangeTypes)[number]

type DynamicFeeProps = {
  value?: number
  range: Record<RangeType, number>
  displayValue?: boolean
}

export const DynamicFee = ({ value, range, displayValue }: DynamicFeeProps) => {
  const { t } = useTranslation("common")

  const currentKey = useMemo(() => {
    if (value) {
      let currentKey: RangeType = "high"

      for (const key in range) {
        const typedKey = key as RangeType
        const rangeValue = range[typedKey]

        if (value <= rangeValue) {
          currentKey = typedKey
          break
        }
      }

      return currentKey
    }
    return undefined
  }, [value, range])

  return (
    <Flex align="center" gap={8}>
      {displayValue && (
        <Text color={getToken("text.high")} fs="p6" fw={500}>
          {t("percent", { value })}
        </Text>
      )}
      <Flex p="1px 2px" gap={1} height="min-content">
        {rangeTypes.map((rangeType) => {
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

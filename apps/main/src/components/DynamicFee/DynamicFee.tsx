import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  DynamicFeeRangeType,
  dynamicFeeRangeTypes,
  SFeeSection,
} from "@/components/DynamicFee/DynamicFee.styled"

type DynamicFeeProps = {
  readonly value?: number
  readonly range: Record<DynamicFeeRangeType, number>
  readonly tooltip?: string
}

export const DynamicFee = ({ value, range, tooltip }: DynamicFeeProps) => {
  const { t } = useTranslation()

  const currentKey = useMemo((): DynamicFeeRangeType | undefined => {
    if (!value) {
      return undefined
    }

    for (const key in range) {
      const typedKey = key as DynamicFeeRangeType
      const rangeValue = range[typedKey]

      if (value <= rangeValue) {
        return typedKey
      }
    }
    return undefined
  }, [value, range])

  return (
    <Flex gap={8} alignItems="center">
      <Text fs="p6" fw={500} color={getToken("text.high")}>
        {t("percent", { value })}
      </Text>
      <Flex p="1px 2px" gap={1} sx={{ height: "min-content" }}>
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

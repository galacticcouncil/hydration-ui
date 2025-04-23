import { Flex } from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import { SFeeSection } from "./DynamicFee.styled"

const rangeTypes = ["low", "middle", "high"] as const
export type RangeType = (typeof rangeTypes)[number]

type DynamicFeeProps = {
  value?: number
  range: Record<RangeType, number>
}

export const DynamicFee = ({ value, range }: DynamicFeeProps) => {
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
    <Flex p="1px 2px" gap={1} sx={{ height: "min-content" }}>
      {rangeTypes.map((rangeType) => {
        const isActive = rangeType === currentKey

        return (
          <SFeeSection key={rangeType} type={rangeType} isActive={isActive}>
            {isActive && <div />}
          </SFeeSection>
        )
      })}
    </Flex>
  )
}

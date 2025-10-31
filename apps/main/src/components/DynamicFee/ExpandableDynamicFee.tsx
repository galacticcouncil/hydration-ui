import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
  Flex,
  Icon,
  Skeleton,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import {
  DynamicFeeRangeType,
  dynamicFeeRangeTypes,
  SFeeSection,
  SFullFeeRangeItem,
  SLine,
} from "@/components/DynamicFee/DynamicFee.styled"

export type FeeBreakdown = {
  symbol: string
  value: string
}

type ExpandableDynamicFeeProps = {
  readonly value: number
  readonly valueDisplay?: string
  readonly rangeLow: number
  readonly rangeHigh: number
  readonly tooltip?: string
  readonly range: number[]
  readonly feesBreakdown: FeeBreakdown[]
  readonly label: string
  readonly description?: string
  readonly className?: string
  readonly loading?: boolean
}

export const ExpandableDynamicFee = ({
  value,
  rangeLow,
  rangeHigh,
  tooltip,
  label,
  description,
  className,
  loading,
  range,
  feesBreakdown,
  valueDisplay,
}: ExpandableDynamicFeeProps) => {
  const { t } = useTranslation(["common", "liquidity"])
  const [expanded, setExpanded] = useState(false)

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
    <Flex direction="column" gap={8} className={className}>
      <CollapsibleRoot open={expanded}>
        <Flex align="center" justify="space-between" my={8}>
          <Flex direction="column" justify="space-between" gap={4}>
            <Text fs="p5" color={getToken("text.medium")}>
              {label}
            </Text>

            {description && (
              <Text fs="p6" fw={400} color={getToken("text.low")}>
                {description}
              </Text>
            )}
          </Flex>

          {loading ? (
            <Skeleton width={50} height={12} />
          ) : (
            <CollapsibleTrigger
              onClick={() => setExpanded((prev) => !prev)}
              sx={{ cursor: "pointer" }}
            >
              <Flex gap={8} align="center">
                <Flex gap={2}>
                  {valueDisplay && (
                    <Text fs="p5" fw={500} color={getToken("text.high")}>
                      {t("currency", {
                        value: valueDisplay,
                      })}
                    </Text>
                  )}
                  <Text fs="p5" fw={500} color={getToken("text.medium")}>
                    {t("percent", { value, prefix: "(", suffix: ")" })}
                  </Text>
                </Flex>

                <Flex p="1px 2px" gap={1} height="min-content">
                  {dynamicFeeRangeTypes.map((rangeType) => {
                    const isActive = rangeType === currentKey

                    return (
                      <SFeeSection
                        key={rangeType}
                        type={rangeType}
                        isActive={isActive}
                      >
                        {isActive && <div />}
                      </SFeeSection>
                    )
                  })}
                </Flex>

                {tooltip && <Tooltip text={tooltip} />}

                <Icon
                  component={ChevronDown}
                  size={18}
                  color={getToken("text.low")}
                  sx={{
                    transition: getToken("transitions.transform"),
                    transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </Flex>
            </CollapsibleTrigger>
          )}
        </Flex>

        <CollapsibleContent>
          <Flex direction="column" gap={8}>
            <Flex justify="space-between" align="start">
              <Text fs="p5" color={getToken("text.medium")}>
                {t("liquidity:liquidity.remove.modal.fee.breakdown")}
              </Text>
              <Flex direction="column" gap={4} align="end">
                {feesBreakdown.map((fee) => (
                  <Text
                    key={fee.symbol}
                    fs="p6"
                    fw={500}
                    color={getToken("text.high")}
                  >
                    {t("currency", {
                      value: fee.value,
                      symbol: fee.symbol,
                    })}
                  </Text>
                ))}
              </Flex>
            </Flex>
            <Flex
              gap={2}
              sx={{
                borderRadius: 50,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {dynamicFeeRangeTypes.map((rangeType) => {
                const isActive = rangeType === currentKey

                return (
                  <SFullFeeRangeItem
                    key={rangeType}
                    type={rangeType}
                    isActive={isActive}
                  >
                    {isActive && <div />}
                  </SFullFeeRangeItem>
                )
              })}

              <SLine />
            </Flex>
            <Flex justify="space-evenly" sx={{ position: "relative" }}>
              {range.map((number, index) => {
                const isFirstEl = index === 0
                const isLastEl = index === range.length - 1
                const isFirstOrLastEl = isFirstEl || isLastEl

                return (
                  <Text
                    key={number.toString()}
                    color={getToken("text.low")}
                    fs={11}
                    sx={
                      isFirstOrLastEl
                        ? {
                            position: "absolute",
                            ...(isFirstEl ? { left: 0 } : { right: 0 }),
                          }
                        : {}
                    }
                  >
                    {t("percent", {
                      value: number,
                      prefix: isFirstEl
                        ? "MIN "
                        : isLastEl
                          ? "MAX "
                          : undefined,
                    })}
                  </Text>
                )
              })}
            </Flex>
            <Text fs="p6" color={getToken("text.medium")}>
              {t("liquidity:liquidity.remove.modal.fee.description")}
            </Text>
          </Flex>
        </CollapsibleContent>
      </CollapsibleRoot>
    </Flex>
  )
}

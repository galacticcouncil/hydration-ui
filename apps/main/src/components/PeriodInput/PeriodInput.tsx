import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  NumberInput,
  Select,
  SelectItem,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import {
  PeriodType,
  periodTypes,
} from "@/components/PeriodInput/PeriodInput.utils"
import i18n from "@/i18n"

export type PeriodInputProps = {
  readonly periodValue?: number | null
  readonly periodType?: PeriodType
  readonly isError?: boolean
  readonly allowedPeriodTypes?: ReadonlySet<PeriodType>
  readonly className?: string
  readonly onPeriodTypeChange: (periodType: PeriodType) => void
  readonly onPeriodValueChange: (periodValue: number | null) => void
}

export const PeriodInput: FC<PeriodInputProps> = ({
  periodValue,
  periodType,
  isError,
  allowedPeriodTypes,
  className,
  onPeriodTypeChange,
  onPeriodValueChange,
}) => {
  const periodOptions = (
    allowedPeriodTypes
      ? periodTypes.filter((periodType) => allowedPeriodTypes.has(periodType))
      : periodTypes
  ).map(
    (type): SelectItem<PeriodType> => ({
      key: type,
      label: i18n.t(`period.${type}`, { count: periodValue ?? 0 }),
    }),
  )

  return (
    <NumberInput
      className={className}
      value={periodValue}
      decimalScale={0}
      allowNegative={false}
      isError={isError}
      onValueChange={({ floatValue }) =>
        onPeriodValueChange(floatValue ?? null)
      }
      trailingElement={
        <Select
          items={periodOptions}
          value={periodType}
          renderTrigger={() => (
            <Flex gap={2} align="center">
              <Text
                fw={500}
                fs={11}
                lh={px(15)}
                transform="uppercase"
                color={getToken("buttons.secondary.low.onRest")}
              >
                {periodType}
              </Text>
              <Icon
                component={ChevronDown}
                size={18}
                color={getToken("icons.onContainer")}
              />
            </Flex>
          )}
          onValueChange={onPeriodTypeChange}
        />
      }
    />
  )
}

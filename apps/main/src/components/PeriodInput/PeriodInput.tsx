import { NumberInput, Select, SelectItem } from "@galacticcouncil/ui/components"
import { FC } from "react"

import {
  PeriodType,
  periodTypes,
} from "@/components/PeriodInput/PeriodInput.utils"
import i18n from "@/i18n"

export type PeriodInputProps = {
  readonly periodValue?: number | null
  readonly periodType?: NoInfer<PeriodType>
  readonly isError?: boolean
  readonly allowedPeriodTypes?: ReadonlySet<PeriodType>
  readonly onPeriodTypeChange: (periodType: NoInfer<PeriodType>) => void
  readonly onPeriodValueChange: (periodValue: number | null) => void
}

export const PeriodInput: FC<PeriodInputProps> = ({
  periodValue,
  periodType,
  isError,
  allowedPeriodTypes,
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
          onValueChange={onPeriodTypeChange}
        />
      }
    />
  )
}

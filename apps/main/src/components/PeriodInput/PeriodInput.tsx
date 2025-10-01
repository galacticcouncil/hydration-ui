import {
  Flex,
  NumberInput,
  SliderTabs,
  SliderTabsOption,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { z } from "zod/v4"

import i18n from "@/i18n"
import { validNumber } from "@/utils/validators"

export const periodTypes = ["hour", "day", "week", "month"] as const
export type PeriodType = (typeof periodTypes)[number]

const periodOptions = periodTypes.map(
  (type): SliderTabsOption<PeriodType> => ({
    id: type,
    label: i18n.t(type),
  }),
)

export type PeriodInputProps = {
  readonly label?: string
  readonly periodValue?: number | null
  readonly periodType?: PeriodType
  readonly isError?: boolean
  readonly onPeriodTypeChange: (periodType: PeriodType) => void
  readonly onPeriodValueChange: (periodValue: number | null) => void
}

export const PeriodInput: FC<PeriodInputProps> = ({
  label,
  periodValue,
  periodType,
  isError,
  onPeriodTypeChange,
  onPeriodValueChange,
}) => {
  return (
    <Flex direction="column" gap={8} py={12}>
      {label && (
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.low")}>
          {label}
        </Text>
      )}
      <Flex gap={8} align="center">
        <NumberInput
          sx={{
            maxWidth: 80,
          }}
          value={periodValue}
          allowNegative={false}
          isError={isError}
          onValueChange={({ floatValue }) =>
            onPeriodValueChange(floatValue ?? null)
          }
        />
        <SliderTabs
          options={periodOptions}
          selected={periodType}
          onSelect={(option) => onPeriodTypeChange(option.id)}
        />
      </Flex>
    </Flex>
  )
}

export const periodInputSchema = z.object({
  value: validNumber.gte(0).nullable(),
  type: z.enum(periodTypes),
})

export type Period = z.infer<typeof periodInputSchema>

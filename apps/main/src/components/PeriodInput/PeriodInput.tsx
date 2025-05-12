import { Flex, Input, SliderTabs, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { capitalize } from "remeda"
import { z } from "zod"

const periodTypes = ["hour", "day", "week", "month"] as const
export type PeriodType = (typeof periodTypes)[number]

const periodOptions = periodTypes.map((type) => ({
  id: type,
  label: capitalize(type),
}))

type Props = {
  readonly label?: string
  readonly period: Period
  readonly onPeriodChange: (period: Period) => void
}

export const PeriodInput: FC<Props> = ({ label, period, onPeriodChange }) => {
  return (
    <Flex direction="column" gap={8} py={12}>
      {label && (
        <Text fw={500} fs="p5" lh={1.2} color={getToken("text.low")}>
          {label}
        </Text>
      )}
      <Flex gap={8} align="center">
        <Input
          sx={{ maxWidth: 80 }}
          type="number"
          value={period.value}
          onChange={(e) =>
            onPeriodChange({
              ...period,
              value: Number(e.target.value) || 0,
            })
          }
        />
        <SliderTabs
          options={periodOptions}
          selected={period.type}
          onSelect={(option) =>
            onPeriodChange({ ...period, type: option.id as PeriodType })
          }
        />
      </Flex>
    </Flex>
  )
}

export const periodInputSchema = z.object({
  value: z.number().gte(1),
  type: z.enum(periodTypes),
})

export type Period = z.infer<typeof periodInputSchema>

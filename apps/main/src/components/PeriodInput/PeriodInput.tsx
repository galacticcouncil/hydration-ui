import { Flex, Input, Tab, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { z } from "zod"

const periodTypes = ["hour", "day", "week", "month"] as const
export type PeriodType = (typeof periodTypes)[number]

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
      <Flex gap={8} align="center" justify="space-between">
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
        <Flex gap={4} align="center" py={4} px={6}>
          {periodTypes.map((type) => (
            <Tab
              key={type}
              sx={{ textTransform: "capitalize" }}
              isActive={period.type === type}
              onClick={() => onPeriodChange({ ...period, type })}
            >
              {type}
            </Tab>
          ))}
        </Flex>
      </Flex>
    </Flex>
  )
}

export const periodInputSchema = z.object({
  value: z.number().gt(0),
  type: z.enum(periodTypes),
})

export type Period = z.infer<typeof periodInputSchema>

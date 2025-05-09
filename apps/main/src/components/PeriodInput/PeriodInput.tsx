import { Flex, Input, MainTab, Text } from "@galacticcouncil/ui/components"
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
        <Flex
          justify="space-between"
          align="center"
          flex={1}
          py={4}
          px={6}
          borderWidth={1}
          borderStyle="solid"
          borderColor={getToken("buttons.outlineDark.onOutline")}
          borderRadius={32}
        >
          {periodTypes.map((type) => (
            <MainTab
              key={type}
              sx={{ textTransform: "capitalize" }}
              isActive={period.type === type}
              onClick={() => onPeriodChange({ ...period, type })}
            >
              {type}
            </MainTab>
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

import { Points, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export type HowToStepsProps = {
  steps: string[]
}

export const HowToSteps: FC<HowToStepsProps> = ({ steps }) => {
  return (
    <Stack gap="s">
      {steps.map((title, index) => (
        <Points
          key={index}
          number={index + 1}
          title={
            <Text as="span" fs="p4" fw={500} color={getToken("text.high")}>
              {title}
            </Text>
          }
        />
      ))}
    </Stack>
  )
}

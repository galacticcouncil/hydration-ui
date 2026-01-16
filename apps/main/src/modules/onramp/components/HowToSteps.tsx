import { Points, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export type HowToStepsProps = {
  steps: string[]
}

export const HowToSteps: FC<HowToStepsProps> = ({ steps }) => {
  return (
    <Stack gap={10}>
      {steps.map((title, index) => (
        <Points
          key={index}
          number={index + 1}
          title={
            <Text as="span" fw={600} color={getToken("text.high")}>
              {title}
            </Text>
          }
        />
      ))}
    </Stack>
  )
}

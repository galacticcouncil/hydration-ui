import { Check, ChevronDown } from "@/assets/icons"
import { Icon, Stack, Text } from "@/components"
import { getToken } from "@/utils"

import { SStepIndicator, SStepTrigger } from "./StepTrigger.styled"

export type StepTriggerState = "active" | "done" | "todo"

export type StepTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  stepNumber: number
  title: string
  description?: string
  state: StepTriggerState
}

export const StepTrigger: React.FC<StepTriggerProps> = ({
  stepNumber,
  title,
  state,
  description,
  ...props
}) => {
  const isActive = state === "active"
  const isDone = state === "done"

  return (
    <SStepTrigger isInteractive={isDone} {...props}>
      <SStepIndicator state={state}>
        {isDone ? (
          <Icon
            size="s"
            component={Check}
            color={getToken("buttons.primary.medium.rest")}
          />
        ) : (
          <Text
            fs="p4"
            fw={600}
            font="primary"
            color={
              isActive
                ? getToken("buttons.primary.medium.onButton")
                : getToken("buttons.primary.medium.rest")
            }
          >
            {stepNumber}
          </Text>
        )}
      </SStepIndicator>
      <Stack gap="2xs" minWidth={0} flex={1}>
        <Text fs="p4" fw={600} lh={1.3} color={getToken("text.high")}>
          {title}
        </Text>
        {description && (
          <Text fs="p5" color={getToken("text.medium")} wordBreak="break-word">
            {description}
          </Text>
        )}
      </Stack>
      {isDone && (
        <Icon
          component={ChevronDown}
          color={getToken("text.medium")}
          size="s"
          sx={{ ml: "auto" }}
        />
      )}
    </SStepTrigger>
  )
}

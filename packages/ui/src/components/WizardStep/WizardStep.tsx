import { Check, ChevronDown } from "@/assets/icons"
import { Icon } from "@/components/Icon"
import { Stack } from "@/components/Stack"
import { Text } from "@/components/Text"
import {
  SStepIndicator,
  SWizardStep,
} from "@/components/WizardStep/WizardStep.styled"
import { getToken } from "@/utils"

export type WizardStepState = "active" | "done" | "todo"

export type WizardStepProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  stepNumber: number
  title: string
  description?: string
  state: WizardStepState
  /** Shown instead of the check once the step is done, sized like the indicator (medium asset logo, 24px). */
  icon?: React.ReactNode
}

export const WizardStep: React.FC<WizardStepProps> = ({
  stepNumber,
  title,
  state,
  description,
  icon,
  ...props
}) => {
  const isActive = state === "active"
  const isDone = state === "done"

  return (
    <SWizardStep isInteractive={isDone} {...props}>
      {isDone && icon ? (
        icon
      ) : (
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
      )}
      <Stack gap="2xs">
        <Text fs="p4" fw={600} lh={1.3} color={getToken("text.high")}>
          {title}
        </Text>
        {description && (
          <Text fs="p5" color={getToken("text.medium")}>
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
    </SWizardStep>
  )
}

import { Fragment } from "react"
import { clamp } from "remeda"

import { CheckIcon } from "@/assets/icons"
import { BoxProps } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { getStepState, StepState } from "@/components/Stepper/Stepper.utils"
import { Text } from "@/components/Text"
import { Tooltip } from "@/components/Tooltip"
import { useBreakpoints } from "@/theme"
import { getToken } from "@/utils"

import {
  SCircle,
  SCompactStepperLayout,
  SExpandedStepperLayout,
  SStepContainer,
  SStepLabel,
  SStepperContainer,
  SStepperLine,
} from "./Stepper.styled"

export type StepperProps = Omit<BoxProps, "width"> & {
  steps: Array<string>
  activeStepIndex: number
  compact?: "auto" | boolean
}

type StepProps = BoxProps & {
  label: string
  state: StepState
  number: number
}

const AUTO_COMPACT_STEP_THRESHOLD = 5

const Step: React.FC<StepProps> = ({ label, state, number, ...props }) => (
  <SStepContainer {...props}>
    <SCircle state={state}>
      {state === StepState.Done ? (
        <Icon component={CheckIcon} size="s" />
      ) : (
        number
      )}
    </SCircle>
    <SStepLabel
      color={
        state === StepState.Active
          ? getToken("text.tint.secondary")
          : getToken("text.medium")
      }
    >
      {label}
    </SStepLabel>
  </SStepContainer>
)

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStepIndex,
  compact = "auto",
  maxWidth,
  className,
  ...props
}) => {
  const { isMobile } = useBreakpoints()
  const totalSteps = steps.length

  const isCompact =
    compact === "auto"
      ? isMobile || totalSteps >= AUTO_COMPACT_STEP_THRESHOLD
      : compact

  const currentIndex = clamp(activeStepIndex, {
    min: 0,
    max: Math.max(totalSteps - 1, 0),
  })

  const currentLabel = steps[currentIndex] ?? ""

  return (
    <SStepperContainer className={className} {...props}>
      {isCompact ? (
        <SCompactStepperLayout>
          <Text color={getToken("text.high")} fs="p5" fw={500} truncate>
            {currentIndex + 1}. {currentLabel}
          </Text>
          <Flex gap="s">
            {steps.map((label, index) => (
              <Tooltip key={index} text={label} side="top" asChild>
                <Step
                  label={label}
                  number={index + 1}
                  state={getStepState(index, activeStepIndex)}
                />
              </Tooltip>
            ))}
          </Flex>
        </SCompactStepperLayout>
      ) : (
        <SExpandedStepperLayout maxWidth={maxWidth}>
          {steps.map((label, index) => (
            <Fragment key={index}>
              <Step
                label={label}
                number={index + 1}
                state={getStepState(index, activeStepIndex)}
              />
              {index < steps.length - 1 && <SStepperLine />}
            </Fragment>
          ))}
        </SExpandedStepperLayout>
      )}
    </SStepperContainer>
  )
}

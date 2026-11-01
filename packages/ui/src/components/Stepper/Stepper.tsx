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
  SStepButton,
  SStepContainer,
  SStepLabel,
  SStepperContainer,
  SStepperLine,
} from "./Stepper.styled"

export type StepperProps = Omit<BoxProps, "width"> & {
  steps: Array<string>
  activeStepIndex: number
  compact?: "auto" | boolean
  onStepClick?: (index: number) => void
}

type StepProps = BoxProps & {
  label: string
  state: StepState
  number: number
  hideLabel?: boolean
}

const AUTO_COMPACT_STEP_THRESHOLD = 5

const Step: React.FC<StepProps> = ({
  label,
  state,
  number,
  hideLabel,
  ...props
}) => (
  <SStepContainer {...props}>
    <SCircle state={state}>
      {state === StepState.Done ? (
        <Icon component={CheckIcon} size="s" />
      ) : (
        number
      )}
    </SCircle>
    {!hideLabel && (
      <SStepLabel
        color={
          state === StepState.Active
            ? getToken("text.tint.secondary")
            : getToken("text.medium")
        }
      >
        {label}
      </SStepLabel>
    )}
  </SStepContainer>
)

export const Stepper: React.FC<StepperProps> = ({
  steps,
  activeStepIndex,
  compact = "auto",
  onStepClick,
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

  const renderStep = (label: string, index: number, hideLabel = false) => {
    const state = getStepState(index, activeStepIndex)

    if (onStepClick) {
      return (
        <SStepButton
          aria-label={label}
          aria-current={index === currentIndex ? "step" : undefined}
          onClick={() => onStepClick(index)}
        >
          <SCircle as="span" state={state}>
            {state === StepState.Done ? (
              <Icon component={CheckIcon} size="s" />
            ) : (
              index + 1
            )}
          </SCircle>
          {!hideLabel && (
            <SStepLabel
              as="span"
              color={
                state === StepState.Active
                  ? getToken("text.tint.secondary")
                  : getToken("text.medium")
              }
            >
              {label}
            </SStepLabel>
          )}
        </SStepButton>
      )
    }

    return (
      <Step
        label={label}
        hideLabel={hideLabel}
        number={index + 1}
        state={state}
      />
    )
  }

  return (
    <SStepperContainer className={className} {...props}>
      {isCompact ? (
        <SCompactStepperLayout>
          <Text color={getToken("text.high")} fs="p5" fw={500} truncate>
            {currentIndex + 1}. {currentLabel}
          </Text>
          <Flex gap="s">
            {steps.map((label, index) => (
              <Tooltip
                key={index}
                text={label}
                side="top"
                size={onStepClick ? "small" : undefined}
                asChild
              >
                {renderStep(label, index, true)}
              </Tooltip>
            ))}
          </Flex>
        </SCompactStepperLayout>
      ) : (
        <SExpandedStepperLayout maxWidth={maxWidth}>
          {steps.map((label, index) => (
            <Fragment key={index}>
              {renderStep(label, index)}
              {index < steps.length - 1 && <SStepperLine />}
            </Fragment>
          ))}
        </SExpandedStepperLayout>
      )}
    </SStepperContainer>
  )
}

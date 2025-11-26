import { Fragment } from "react"
import { clamp } from "remeda"

import { CheckIcon } from "@/assets/icons"
import { BoxProps } from "@/components/Box"
import { Flex } from "@/components/Flex"
import { Icon } from "@/components/Icon"
import { getStepState, StepState } from "@/components/Stepper/Stepper.utils"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import {
  SCircle,
  SDesktopContainer,
  SMobileContainer,
  SStepContainer,
  SStepLabel,
  SStepperContainer,
  SStepperLine,
} from "./Stepper.styled"

export type StepperProps = Omit<BoxProps, "width"> & {
  steps: Array<string>
  activeStepIndex: number
}

type StepProps = {
  label: string
  state: StepState
  number: number
}

const Step: React.FC<StepProps> = ({ label, state, number }) => (
  <SStepContainer>
    <SCircle state={state}>
      {state === StepState.Done ? (
        <Icon component={CheckIcon} size={14} />
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
  maxWidth,
  className,
  ...props
}) => {
  const totalSteps = steps.length

  const currentIndex = clamp(activeStepIndex, {
    min: 0,
    max: totalSteps - 1,
  })

  const currentLabel = steps[currentIndex]

  return (
    <SStepperContainer className={className} {...props}>
      <SDesktopContainer maxWidth={maxWidth}>
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
      </SDesktopContainer>
      <SMobileContainer>
        <Text color={getToken("text.high")} fs="p5" fw={500} truncate>
          {currentLabel}
        </Text>
        <Flex gap={4}>
          {steps.map((label, index) => (
            <Step
              key={index}
              label={label}
              number={index + 1}
              state={getStepState(index, activeStepIndex)}
            />
          ))}
        </Flex>
      </SMobileContainer>
    </SStepperContainer>
  )
}

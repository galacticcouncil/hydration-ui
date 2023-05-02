import { ReactComponent as DoneIcon } from "assets/icons/StepperDoneIcon.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { Fragment } from "react"
import {
  SCircle,
  SStepperContainer,
  SStepperLine,
  SThumbContainer,
} from "./Stepper.styled"

const STEP_STATES = ["active", "done", "todo"] as const

type StepState = (typeof STEP_STATES)[number]

type StepperProps = { steps: Array<StepProps> }

export type StepProps = {
  label: string
  state: StepState
}

const Step = ({ label, state }: StepProps) => {
  const isDone = state === "done"
  const isTodo = state === "todo"
  return (
    <div sx={{ flex: "column", gap: 4, align: "center" }}>
      <SCircle>
        {!isTodo && (
          <SThumbContainer isDone={isDone}>
            {isDone && (
              <Icon sx={{ color: "brightBlue300" }} icon={<DoneIcon />} />
            )}
          </SThumbContainer>
        )}
      </SCircle>
      <Text
        fs={12}
        color={state === "active" ? "brightBlue600" : "basic500"}
        css={{ position: "absolute", bottom: 0, whiteSpace: "nowrap" }}
      >
        {label}
      </Text>
    </div>
  )
}

export const Stepper = ({ steps }: StepperProps) => {
  return (
    <SStepperContainer>
      {steps.map((step, index) => (
        <Fragment key={index}>
          <Step {...step} />
          {index < steps.length - 1 && <SStepperLine />}
        </Fragment>
      ))}
    </SStepperContainer>
  )
}

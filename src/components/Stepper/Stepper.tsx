import {
  SCircle,
  SStepperContainer,
  SStepperLine,
  SThumbContainer,
} from "./Stepper.styled"
import { ReactComponent as DoneIcon } from "assets/icons/StepperDoneIcon.svg"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { Fragment } from "react"

export const fakeSteps: StepProps[] = [
  {
    label: "Join Farm 1",
    state: "active",
  },
  {
    label: "Join Farm 2",
    state: "todo",
  },
]

const STEP_STATES = ["active", "done", "todo"] as const

type StepState = typeof STEP_STATES[number]

type StepperProps = { steps: Array<StepProps> }

type StepProps = {
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
        css={{ position: "absolute", bottom: "-20px", whiteSpace: "nowrap" }}
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

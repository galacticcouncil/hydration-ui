export enum StepState {
  Active = "active",
  Done = "done",
  Todo = "todo",
}

export function getStepState(
  stepIndex: number,
  activeStepIndex: number,
): StepState {
  if (stepIndex === activeStepIndex) {
    return StepState.Active
  }

  return activeStepIndex > stepIndex ? StepState.Done : StepState.Todo
}

import { Spacer } from "components/Spacer/Spacer"
import { Stepper } from "components/Stepper/Stepper"
import { useMemo } from "react"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { useMemepadFormContext } from "./MemepadFormContext"

export const MemepadForm = () => {
  const { step, currentForm, isLoading } = useMemepadFormContext()

  const steps = useMemo(() => {
    const stepLabels = [
      "Create & Register",
      "Transfer Liquidity",
      "Create Isolated Pool",
      "Summary",
    ]
    return stepLabels.map(
      (label, index) =>
        ({
          label,
          state: step === index ? "active" : step > index ? "done" : "todo",
        }) as const,
    )
  }, [step])

  return (
    <div>
      <Stepper fullWidth steps={steps} />
      <Spacer size={60} />
      {isLoading ? <MemepadSpinner /> : currentForm}
    </div>
  )
}

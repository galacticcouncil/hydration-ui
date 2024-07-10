import { Spacer } from "components/Spacer/Spacer"
import { Stepper } from "components/Stepper/Stepper"
import { useMemo } from "react"
import { useMemepadForms } from "./MemepadForm.utils"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"

type MemepadFormProps = ReturnType<typeof useMemepadForms>

export const MemepadForm: React.FC<MemepadFormProps> = ({
  step,
  currentForm,
  summary,
  isLoading,
}) => {
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
      {/* <pre sx={{ color: "white" }}>{JSON.stringify(summary, null, 2)}</pre> */}
    </div>
  )
}

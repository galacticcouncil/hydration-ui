import { Spacer } from "components/Spacer/Spacer"
import { Spinner } from "components/Spinner/Spinner"
import { Stepper } from "components/Stepper/Stepper"
import { useMemo } from "react"
import { useMemepadForms } from "./MemepadForm.utils"

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
      {isLoading ? (
        <Spinner size={120} sx={{ mx: "auto", my: 50 }} />
      ) : (
        currentForm
      )}
      {/* <pre sx={{ color: "white" }}>{JSON.stringify(summary, null, 2)}</pre> */}
    </div>
  )
}

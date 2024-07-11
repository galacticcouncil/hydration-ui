import { Spacer } from "components/Spacer/Spacer"
import { Stepper } from "components/Stepper/Stepper"
import { useMemo } from "react"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { useMemepadFormContext } from "./MemepadFormContext"
import { useTranslation } from "react-i18next"

const useSpinnerPropsByStep = (step: number) => {
  const { t } = useTranslation()
  switch (step) {
    case 0:
      return {
        title: t("memepad.form.spinner.step1.title"),
        description: t("memepad.form.spinner.step1.description"),
      }
    case 1:
      return {
        title: t("memepad.form.spinner.step2.title"),
        description: t("memepad.form.spinner.step2.description"),
      }
    case 2:
      return {
        title: t("memepad.form.spinner.step3.title"),
        description: t("memepad.form.spinner.step3.description"),
      }
  }
}

export const MemepadForm = () => {
  const { t } = useTranslation()
  const { step, currentForm, isLoading } = useMemepadFormContext()
  const spinnerProps = useSpinnerPropsByStep(step)

  const steps = useMemo(() => {
    const stepLabels = [
      t("memepad.form.step1.title"),
      t("memepad.form.step2.title"),
      t("memepad.form.step3.title"),
      t("memepad.form.step4.title"),
    ]
    return stepLabels.map(
      (label, index) =>
        ({
          label,
          state: step === index ? "active" : step > index ? "done" : "todo",
        }) as const,
    )
  }, [step, t])

  return (
    <div>
      <Stepper fullWidth steps={steps} />
      <Spacer size={60} />
      {isLoading ? <MemepadSpinner {...spinnerProps} /> : currentForm}
    </div>
  )
}

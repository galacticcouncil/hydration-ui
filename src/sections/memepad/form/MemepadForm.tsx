import { Stepper } from "components/Stepper/Stepper"
import { useMemo } from "react"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { useMemepadFormContext } from "./MemepadFormContext"
import { useTranslation } from "react-i18next"

const useSpinnerPropsByStep = () => {
  const { step, summary } = useMemepadFormContext()
  const { t } = useTranslation()

  if (step === 0) {
    if (summary?.id) {
      return {
        title: t("memepad.form.spinner.register.title"),
        description: t("memepad.form.spinner.register.description"),
      }
    } else {
      return {
        title: t("memepad.form.spinner.create.title"),
        description: t("memepad.form.spinner.create.description"),
      }
    }
  }

  if (step === 1) {
    return {
      title: t("memepad.form.spinner.transfer.title"),
      description: t("memepad.form.spinner.transfer.description"),
    }
  }

  if (step === 2) {
    return {
      title: t("memepad.form.spinner.xyk.title"),
      description: t("memepad.form.spinner.xyk.description"),
    }
  }

  return {}
}

export const MemepadForm = () => {
  const { t } = useTranslation()
  const spinnerProps = useSpinnerPropsByStep()
  const { step, currentForm, isLoading } = useMemepadFormContext()

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
    <div sx={{ flex: "column", gap: [20, 60] }}>
      <Stepper steps={steps} />
      <div>
        {isLoading ? <MemepadSpinner {...spinnerProps} /> : currentForm}
      </div>
    </div>
  )
}

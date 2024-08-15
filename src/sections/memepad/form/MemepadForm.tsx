import { Stepper } from "components/Stepper/Stepper"
import { useTranslation } from "react-i18next"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { useMemepadFormContext } from "./MemepadFormContext"
import { useInterval } from "react-use"
import { useState } from "react"

const RandomMemeSpinner = () => {
  const { t } = useTranslation()

  const texts = [
    t("memepad.form.spinner.meme.1"),
    t("memepad.form.spinner.meme.2"),
    t("memepad.form.spinner.meme.3"),
    t("memepad.form.spinner.meme.4"),
    t("memepad.form.spinner.meme.5"),
    t("memepad.form.spinner.meme.6"),
    t("memepad.form.spinner.meme.7"),
    t("memepad.form.spinner.meme.8"),
    t("memepad.form.spinner.meme.9"),
    t("memepad.form.spinner.meme.10"),
  ]

  const [title, setTitle] = useState(getRandomText())

  useInterval(() => {
    setTitle(getRandomText())
  }, 10000)

  function getRandomText() {
    return texts[Math.floor(Math.random() * texts.length)]
  }

  return (
    <MemepadSpinner
      title={title}
      description={t("memepad.form.spinner.wait")}
    />
  )
}

export const MemepadForm = () => {
  const { formComponent, isLoading, steps } = useMemepadFormContext()

  return (
    <div sx={{ flex: "column", gap: [20] }}>
      <Stepper steps={steps} sx={{ mb: [0, 60] }} />
      <div>{isLoading ? <RandomMemeSpinner /> : formComponent}</div>
    </div>
  )
}

import { Stepper } from "components/Stepper/Stepper"
import { useTranslation } from "react-i18next"
import { MemepadSpinner } from "sections/memepad/components/MemepadSpinner"
import { MemepadFormAlerts } from "sections/memepad/form/MemepadFormAlerts"
import { useMemepadFormContext } from "./MemepadFormContext"
import { useInterval } from "react-use"
import { useState } from "react"

const MEME_TEXTS = [
  "Your memecoins are getting cooked...",
  "Steady lads. Deploying more memes...",
  "Doge might not make it, but this meme will!",
  "This meme is a 1/1, unlike your JPEGs.",
  "Minting memes, one coin at a time.",
  "Patience, memecoins take time to marinate.",
  "Creating a memecoin: 1% coding, 99% memes.",
  "In the lab, brewing up the next meme sensation.",
  "Almost there… just need to avoid a rug pull.",
  "Engineering a memecoin that won't get REKT",
]

function getRandomText() {
  return MEME_TEXTS[Math.floor(Math.random() * MEME_TEXTS.length)]
}

const RandomMemeSpinner = () => {
  const { t } = useTranslation()

  const [title, setTitle] = useState(getRandomText())
  useInterval(() => {
    setTitle(getRandomText())
  }, 10000)

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
      <MemepadFormAlerts />
    </div>
  )
}

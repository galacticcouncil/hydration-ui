import { Button } from "components/Button/Button"
import { SContainer } from "./MemepadActionBar.styled"
import { useTranslation } from "react-i18next"

type MemepadActionBarProps = {
  step: number
  onNext?: () => void
}

export const MemepadActionBar: React.FC<MemepadActionBarProps> = ({
  step,
  onNext,
}) => {
  const { t } = useTranslation()
  return (
    <SContainer>
      <Button
        variant="primary"
        sx={{ minWidth: ["100%", 150] }}
        onClick={onNext}
      >
        {step === 0 && t("memepad.form.submit.step1")}
        {step === 1 && t("memepad.form.submit.step2")}
        {step === 2 && t("memepad.form.submit.step3")}
      </Button>
    </SContainer>
  )
}

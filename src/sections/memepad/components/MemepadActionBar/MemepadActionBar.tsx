import { Button } from "components/Button/Button"
import { SContainer } from "./MemepadActionBar.styled"
import { useTranslation } from "react-i18next"

type MemepadActionBarProps = {
  step: number
  isLoading?: boolean
  isRegistering?: boolean
  onNext?: () => void
}

export const MemepadActionBar: React.FC<MemepadActionBarProps> = ({
  step,
  isLoading = false,
  isRegistering = false,
  onNext,
}) => {
  const { t } = useTranslation()
  return (
    <SContainer>
      <Button
        disabled={isLoading}
        isLoading={isLoading}
        variant="primary"
        sx={{ minWidth: ["100%", 200] }}
        onClick={onNext}
      >
        {step === 0 && (
          <>
            {isRegistering
              ? t("memepad.form.submit.register")
              : t("memepad.form.submit.create")}
          </>
        )}
        {step === 1 && t("memepad.form.submit.transfer")}
        {step === 2 && t("memepad.form.submit.finish")}
      </Button>
    </SContainer>
  )
}

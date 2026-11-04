import { Alert, Button } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const DepositSameAccountAlert = ({
  onChange,
  disabled = false,
}: {
  onChange: () => void
  disabled?: boolean
}) => {
  const { t } = useTranslation("onramp")
  return (
    <Alert
      variant="warning"
      title={t("deposit.sameAccount.title")}
      description={t("deposit.sameAccount.description")}
      action={
        <Button
          variant="secondary"
          size="small"
          disabled={disabled}
          onClick={onChange}
        >
          {t("deposit.sameAccount.action")}
        </Button>
      }
    />
  )
}

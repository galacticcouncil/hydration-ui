import { Alert } from "components/Alert"
import { CheckBox } from "components/CheckBox/CheckBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export type HealthFactorRiskWarningProps = {
  className?: string
  accepted: boolean
  isBelowThreshold?: boolean
  onAcceptedChange: (accepted: boolean) => void
}

export const HealthFactorRiskWarning: React.FC<
  HealthFactorRiskWarningProps
> = ({ className, accepted, onAcceptedChange, isBelowThreshold }) => {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <Alert variant={isBelowThreshold ? "error" : "warning"}>
        {t("liquidity.reviewTransaction.modal.healthfactor.alert")}
      </Alert>
      {isBelowThreshold && (
        <CheckBox
          sx={{ mt: 10 }}
          label={
            <Text fs={14} lh={28}>
              {t("liquidity.reviewTransaction.modal.healthfactor.accept")}
            </Text>
          }
          checked={accepted}
          onChange={onAcceptedChange}
        />
      )}
    </div>
  )
}

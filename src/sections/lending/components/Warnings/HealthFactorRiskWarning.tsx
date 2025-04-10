import { Alert } from "components/Alert"
import { CheckBox } from "components/CheckBox/CheckBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export type HealthFactorRiskWarningProps = {
  className?: string
  accepted: boolean
  onAcceptedChange: (accepted: boolean) => void
}

export const HealthFactorRiskWarning: React.FC<
  HealthFactorRiskWarningProps
> = ({ className, accepted, onAcceptedChange }) => {
  const { t } = useTranslation()
  return (
    <div className={className}>
      <Alert variant="error">
        {t("liquidity.reviewTransaction.modal.healthfactor.alert")}
      </Alert>
      <div sx={{ flex: "row", align: "center", mt: 10 }}>
        <CheckBox
          label={
            <Text fs={14} lh={28}>
              {t("liquidity.reviewTransaction.modal.healthfactor.accept")}
            </Text>
          }
          checked={accepted}
          onChange={onAcceptedChange}
        />
      </div>
    </div>
  )
}

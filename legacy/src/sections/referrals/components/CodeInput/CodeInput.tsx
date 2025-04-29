import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { InputHTMLAttributes, forwardRef } from "react"
import { SAlertMessage, SInput, SInputWrapper } from "./CodeInput.styled"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { randomAlphanumericString } from "utils/helpers"
import DiceIcon from "assets/icons/DiceIcon.svg?react"
import { REFERRAL_CODE_MAX_LENGTH } from "sections/referrals/ReferralsPage.utils"
import { useRegistrationLinkFee } from "api/referrals"
import { Spacer } from "components/Spacer/Spacer"

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  error?: string
  onChange: (value: string) => void
}

export const CodeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, className, error, ...props }, ref) => {
    const { t } = useTranslation()

    const registrationFee = useRegistrationLinkFee()

    return (
      <SInputWrapper className={className}>
        <ChainlinkIcon />
        <SInput
          ref={ref}
          autoComplete="off"
          hasError={!!error}
          sx={!props.disabled ? { pr: [40, 180] } : {}}
          {...props}
          onChange={(e) => onChange?.(e.target.value.toUpperCase())}
        />
        {!props.disabled && (
          <Button
            size="micro"
            type="button"
            sx={{ px: [0, 6], py: [0, 2] }}
            onClick={() =>
              onChange?.(
                randomAlphanumericString(
                  REFERRAL_CODE_MAX_LENGTH,
                ).toUpperCase(),
              )
            }
          >
            <DiceIcon sx={{ width: 10, height: 10, mr: -4 }} />
            {t("referrals.button.randomCode")}
          </Button>
        )}
        <Spacer size={2} />
        {error && <SAlertMessage variant="error">{error}</SAlertMessage>}
        {!error && registrationFee.data && (
          <SAlertMessage variant="info">
            {t("referrals.button.linkFee", {
              amount: registrationFee.data?.amount,
              symbol: registrationFee.data.symbol,
            })}
          </SAlertMessage>
        )}
      </SInputWrapper>
    )
  },
)

import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { InputHTMLAttributes, forwardRef } from "react"
import { SErrorMessage, SInput, SInputWrapper } from "./CodeInput.styled"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { randomAlphanumericString } from "utils/helpers"
import DiceIcon from "assets/icons/DiceIcon.svg?react"
import { REFERRAL_CODE_MAX_LENGTH } from "sections/referrals/ReferralsPage.utils"
import { useReferralCodeLength } from "api/referrals"

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  error?: string
  onChange: (value: string) => void
}

export const CodeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, className, error, ...props }, ref) => {
    const { t } = useTranslation()
    const referralCodeLength = useReferralCodeLength()

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
                  referralCodeLength.data?.toNumber() ??
                    REFERRAL_CODE_MAX_LENGTH,
                ).toUpperCase(),
              )
            }
          >
            <DiceIcon sx={{ width: 10, height: 10, mr: -4 }} />
            {t("referrals.button.randomCode")}
          </Button>
        )}
        {error && <SErrorMessage>{error}</SErrorMessage>}
      </SInputWrapper>
    )
  },
)

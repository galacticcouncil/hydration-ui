import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { InputHTMLAttributes, forwardRef } from "react"
import { SInput, SInputWrapper } from "./CodeInput.styled"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { randomAlphanumericString } from "utils/helpers"
import { ErrorMessage } from "components/Label/Label.styled"
import DiceIcon from "assets/icons/DiceIcon.svg?react"
import { REFERRAL_CODE_MAX_LENGTH } from "sections/referrals/ReferralsPage.utils"

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  error?: string
  onChange: (value: string) => void
}

export const CodeInput = forwardRef<HTMLInputElement, InputProps>(
  ({ onChange, className, error, ...props }, ref) => {
    const { t } = useTranslation()
    return (
      <SInputWrapper className={className}>
        <ChainlinkIcon />
        <SInput
          ref={ref}
          autoComplete="off"
          hasError={!!error}
          sx={!props.disabled ? { pr: 180 } : {}}
          {...props}
          onChange={(e) => onChange?.(e.target.value)}
        />
        {!props.disabled && (
          <Button
            size="micro"
            type="button"
            onClick={() =>
              onChange?.(randomAlphanumericString(REFERRAL_CODE_MAX_LENGTH))
            }
          >
            <DiceIcon width={10} height={10} sx={{ mx: -4 }} />
            {t("referrals.button.randomCode")}
          </Button>
        )}
        {error && (
          <ErrorMessage css={{ position: "absolute", top: "100%", left: 0 }}>
            {error}
          </ErrorMessage>
        )}
      </SInputWrapper>
    )
  },
)

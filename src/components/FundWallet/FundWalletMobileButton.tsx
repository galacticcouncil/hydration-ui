import { Button, ButtonProps } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import FundIcon from "assets/icons/FundIcon.svg?react"

type Props = Pick<ButtonProps, "onClick">

export const FundWalletMobileButton = (props: Props) => {
  const { t } = useTranslation()

  return (
    <Button {...props} variant="primary" fullWidth={true}>
      <FundIcon />
      {t("fund.button")}
    </Button>
  )
}

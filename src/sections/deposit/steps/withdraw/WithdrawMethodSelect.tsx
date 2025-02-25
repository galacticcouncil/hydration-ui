import { useNavigate } from "@tanstack/react-location"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { useTranslation } from "react-i18next"
import { StepButton } from "sections/deposit/components/StepButton"
import { DepositMethod } from "sections/deposit/types"
import { LINKS } from "utils/navigation"
import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import SuitcaseIcon from "assets/icons/SuitcaseIcon.svg?react"
import CreditCardIcon from "assets/icons/CreditCardIcon.svg?react"
import { useMedia } from "react-use"
import { theme } from "theme"

type WithdrawMethodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

export const WithdrawMethodSelect: React.FC<WithdrawMethodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  return (
    <>
      <GradientText
        fs={28}
        gradient="pinkLightBlue"
        sx={{ mb: 20 }}
        css={{ alignSelf: "start" }}
      >
        {t("withdraw.method.title")}
      </GradientText>
      <div sx={{ flex: "column", gap: 20 }}>
        {isDesktop && (
          <StepButton
            icon={SuitcaseIcon}
            onClick={() => onSelect(DepositMethod.WithdrawCex)}
            title={t("withdraw.method.cex.title")}
            description={t("withdraw.method.cex.description")}
          />
        )}
        <StepButton
          icon={ChainlinkIcon}
          onClick={() => navigate({ to: LINKS.cross_chain })}
          title={t("withdraw.method.onchain.title")}
          description={t("withdraw.method.onchain.description")}
        />
        <StepButton
          icon={CreditCardIcon}
          onClick={() => onSelect(DepositMethod.WithdrawBank)}
          title={t("withdraw.method.bank.title")}
          description={t("withdraw.method.bank.description")}
        />
      </div>
    </>
  )
}

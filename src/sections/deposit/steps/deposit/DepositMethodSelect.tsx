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

type methodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

export const DepositMethodSelect: React.FC<methodSelectProps> = ({
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
        {t("deposit.method.title")}
      </GradientText>
      <div sx={{ flex: "column", gap: 20 }}>
        {isDesktop && (
          <StepButton
            icon={SuitcaseIcon}
            onClick={() => onSelect(DepositMethod.DepositCex)}
            title={t("deposit.method.cex.title")}
            description={t("deposit.method.cex.description")}
          />
        )}
        <StepButton
          icon={ChainlinkIcon}
          onClick={() => navigate({ to: LINKS.cross_chain })}
          title={t("deposit.method.onchain.title")}
          description={t("deposit.method.onchain.description")}
        />
        <StepButton
          icon={CreditCardIcon}
          onClick={() => onSelect(DepositMethod.DepositBank)}
          title={t("deposit.method.bank.title")}
          description={t("deposit.method.bank.description")}
        />
      </div>
    </>
  )
}

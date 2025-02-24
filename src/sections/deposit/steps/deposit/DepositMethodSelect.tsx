import { useNavigate } from "@tanstack/react-location"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { useTranslation } from "react-i18next"
import { StepButton } from "sections/deposit/components/StepButton"
import { DepositMethod } from "sections/deposit/types"
import { LINKS } from "utils/navigation"
import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import SuitcaseIcon from "assets/icons/SuitcaseIcon.svg?react"
import CreditCardIcon from "assets/icons/CreditCardIcon.svg?react"

type methodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

export const DepositMethodSelect: React.FC<methodSelectProps> = ({
  onSelect,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <div>
        <GradientText fs={28} gradient="pinkLightBlue" sx={{ mb: 20 }}>
          {t("deposit.method.title")}
        </GradientText>
      </div>
      <div sx={{ flex: "column", gap: 20 }}>
        <StepButton
          icon={SuitcaseIcon}
          onClick={() => onSelect(DepositMethod.DepositCex)}
          title={t("deposit.method.cex.title")}
          description={t("deposit.method.cex.description")}
        />
        <StepButton
          icon={ChainlinkIcon}
          onClick={() => navigate({ to: LINKS.cross_chain })}
          title={t("deposit.method.onchain.title")}
          description={t("deposit.method.onchain.description")}
        />

        <StepButton
          icon={CreditCardIcon}
          onClick={() => onSelect(DepositMethod.DepositCrypto)}
          title={t("deposit.method.crypto.title")}
          description={t("deposit.method.crypto.description")}
        />
      </div>
    </>
  )
}

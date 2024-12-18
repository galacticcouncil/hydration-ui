import { useNavigate } from "@tanstack/react-location"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { StepButton } from "sections/deposit/components/StepButton"
import { DepositMethod } from "sections/deposit/types"
import { LINKS } from "utils/navigation"

type DepositMethodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  const navigate = useNavigate()
  return (
    <div>
      <GradientText fs={28} gradient="pinkLightBlue" sx={{ mb: 20 }}>
        Deposit
      </GradientText>
      <div sx={{ flex: "column", gap: 20 }}>
        <StepButton
          onClick={() => onSelect(DepositMethod.DepositCex)}
          title="Deposit from Centralized Exchange"
          description="Some short description here so all less and more experienced people would understand che choice"
        />
        <StepButton
          onClick={() => navigate({ to: LINKS.cross_chain })}
          title="On-chain deposit "
          description="Some short description here so all less and more experienced people would understand che choice"
        />
        <StepButton
          onClick={() => onSelect(DepositMethod.DepositCrypto)}
          title="Fund with crypto"
          description="Some short description here so all less and more experienced people would understand che choice"
        />
      </div>
    </div>
  )
}

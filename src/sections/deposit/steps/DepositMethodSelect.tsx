import { useNavigate } from "@tanstack/react-location"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { DepositMethod } from "sections/deposit/types"
import { LINKS } from "utils/navigation"
import { SButton } from "./DepositMethodSelect.styled"

type DepositMethodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

const DepositMethodButton: React.FC<{
  onClick?: () => void
  title: string
  description: string
}> = ({ onClick, title, description }) => (
  <SButton
    onClick={onClick}
    css={!onClick && { pointerEvents: "none", opacity: 0.3 }}
  >
    <div>
      <Text fs={18} font="GeistSemiBold" color="basic100" sx={{ mb: 6 }}>
        {title}
      </Text>
      <Text fs={14} lh={20} color="basic500">
        {description}
      </Text>
    </div>
    <Icon size={20} icon={<ChevronRight sx={{ color: "brightBlue300" }} />} />
  </SButton>
)

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
        <DepositMethodButton
          onClick={() => onSelect(DepositMethod.DepositCex)}
          title="Deposit from Centralized Exchange"
          description="Some short description here so all less and more experienced people would understand che choice"
        />
        <DepositMethodButton
          onClick={() => navigate({ to: LINKS.cross_chain })}
          title="On-chain deposit "
          description="Some short description here so all less and more experienced people would understand che choice"
        />
        <DepositMethodButton
          onClick={() => onSelect(DepositMethod.DepositCrypto)}
          title="Fund with crypto"
          description="Some short description here so all less and more experienced people would understand che choice"
        />
      </div>
    </div>
  )
}

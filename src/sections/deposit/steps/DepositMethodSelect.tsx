import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Icon } from "components/Icon/Icon"
import { GradientText } from "components/Typography/GradientText/GradientText"
import { Text } from "components/Typography/Text/Text"
import { DepositMethod } from "sections/deposit/types"
import { SButton } from "./DepositMethodSelect.styled"

type DepositMethodSelectProps = {
  onSelect: (method: DepositMethod) => void
}

export const DepositMethodSelect: React.FC<DepositMethodSelectProps> = ({
  onSelect,
}) => {
  return (
    <div sx={{ px: 18, pb: 18 }}>
      <GradientText fs={28} gradient="pinkLightBlue" sx={{ mb: 20 }}>
        Deposit
      </GradientText>
      <SButton onClick={() => onSelect(DepositMethod.DepositCex)}>
        <div>
          <Text fs={18} font="GeistSemiBold" color="basic100" sx={{ mb: 6 }}>
            Deposit from Centralized Exchange
          </Text>
          <Text fs={14} lh={20} color="basic500">
            Some short description here so all less and more experienced people
            would understand che choice
          </Text>
        </div>
        <Icon
          size={20}
          icon={<ChevronRight sx={{ color: "brightBlue300" }} />}
        />
      </SButton>
    </div>
  )
}

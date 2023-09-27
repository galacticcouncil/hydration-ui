import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import ChevronRight from "assets/icons/ChevronRight.svg?react"

import { SContainer } from "./WalletTransferCrosschainListItem.styled"
import { WalletTransferCrosschainLogo } from "./WalletTransferCrosschainLogo"
import { theme } from "theme"

type Props = {
  icon: ReactNode
  name: ReactNode
  description?: string
  onClick: () => void
}

export function WalletTransferCrosschainListItem({
  onClick,
  icon,
  name,
  description,
}: Props) {
  const { t } = useTranslation()
  return (
    <SContainer onClick={onClick}>
      <WalletTransferCrosschainLogo icon={icon} />

      <span sx={{ flex: "column", flexGrow: 1 }}>
        <Text fs={18} fw={700}>
          {name}
        </Text>
        <Text fs={12} fw={500} lh={16} color="basic400">
          {description}
        </Text>
      </span>

      <ChevronRight css={{ flexShrink: 0 }} color={theme.colors.basic400} />
    </SContainer>
  )
}

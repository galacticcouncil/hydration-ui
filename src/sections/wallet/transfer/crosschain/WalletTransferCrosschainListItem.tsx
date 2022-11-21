import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { ReactComponent as ChevronRight } from "assets/icons/ChevronRight.svg"

import { SContainer } from "./WalletTransferCrosschainListItem.styled"
import { WalletTransferCrosschainLogo } from "./WalletTransferCrosschainLogo"
import { theme } from "theme"

export function WalletTransferCrosschainListItem(props: {
  icon: ReactNode
  name: ReactNode
  type: "ingoing" | "outgoing" | "both"
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <SContainer onClick={props.onClick}>
      <WalletTransferCrosschainLogo icon={props.icon} />

      <span sx={{ flex: "column", flexGrow: 1 }}>
        <Text fs={18} fw={700}>
          {props.name}
        </Text>
        <Text fs={12} fw={500} lh={16} color="basic400">
          {t(`wallet.assets.transfer.crosschain.type.${props.type}`)}
        </Text>
      </span>

      <ChevronRight css={{ flexShrink: 0 }} color={theme.colors.basic400} />
    </SContainer>
  )
}

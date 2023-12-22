import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import ChevronRight from "assets/icons/ChevronRight.svg?react"

import { SContainer, SLink } from "./BridgeListItem.styled"
import { BridgeChainLogo } from "./BridgeChainLogo"
import { theme } from "theme"

type Props = {
  icon: ReactNode
  name: ReactNode
  description: string
  url: string
}

export function BridgeListItem({ icon, name, description, url }: Props) {
  return (
    <SContainer>
      <BridgeChainLogo icon={icon} />
      <span sx={{ flex: "column", flexGrow: 1 }}>
        <Text fs={18} fw={700}>
          <SLink target="_blank" rel="noreferrer" href={url}>
            {name}
          </SLink>
        </Text>
        <Text fs={12} fw={500} lh={16} color="basic400">
          {description}
        </Text>
      </span>
      <ChevronRight css={{ flexShrink: 0 }} color={theme.colors.basic400} />
    </SContainer>
  )
}

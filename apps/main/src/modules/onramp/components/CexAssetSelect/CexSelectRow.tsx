import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"

import { SButton } from "./CexSelectRow.styled"

export const CEX_ROW_HEIGHT = 36

type CexSelectRowProps = {
  title: string
  logo: React.ComponentType
  isActive: boolean
  onClick: () => void
}

export const CexSelectRow: React.FC<CexSelectRowProps> = ({
  title,
  logo,
  isActive,
  onClick,
}) => {
  return (
    <Flex
      height={CEX_ROW_HEIGHT}
      align="center"
      px={getTokenPx("scales.paddings.s")}
    >
      <SButton
        variant={isActive ? "accent" : "transparent"}
        outline={isActive}
        onClick={onClick}
        isActive={isActive}
      >
        <Icon component={logo} />
        <Flex>
          <Text fs={12} fw={500}>
            {title}
          </Text>
        </Flex>
      </SButton>
    </Flex>
  )
}

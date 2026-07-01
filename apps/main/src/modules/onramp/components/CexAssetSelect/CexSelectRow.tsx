import { Flex, Icon, Text } from "@galacticcouncil/ui/components"

import { SButton } from "./CexSelectRow.styled"

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
    <Flex align="center" px="s">
      <SButton
        variant={isActive ? "accent" : "transparent"}
        outline={isActive}
        onClick={onClick}
        isActive={isActive}
      >
        <Icon component={logo} />
        <Flex>
          <Text fs="p5" fw={500}>
            {title}
          </Text>
        </Flex>
      </SButton>
    </Flex>
  )
}

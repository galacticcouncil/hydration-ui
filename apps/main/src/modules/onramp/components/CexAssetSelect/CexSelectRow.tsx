import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import { SButton } from "./CexSelectRow.styled"

type CexSelectRowProps = {
  title: string
  logo: React.ComponentType
  isActive: boolean
  onClick: () => void
  mobile?: boolean
}

export const CexSelectRow: React.FC<CexSelectRowProps> = ({
  title,
  logo,
  isActive,
  onClick,
  mobile = false,
}) => {
  return (
    <SButton
      variant={mobile ? "secondary" : isActive ? "accent" : "transparent"}
      outline={!mobile && isActive}
      onClick={onClick}
      isActive={isActive}
      {...(mobile && {
        height: pxToRem(52),
        sx: { px: "m", borderRadius: "m" },
      })}
    >
      <Icon component={logo} size={mobile ? "l" : "m"} />
      <Flex>
        <Text fs="p5" fw={500}>
          {title}
        </Text>
      </Flex>
    </SButton>
  )
}

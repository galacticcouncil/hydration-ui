import { Blend } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  LOGO_SIZES,
  LogoSize,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"

export const MultiplyLogo = ({ size = "medium" }: { size?: LogoSize }) => {
  const px = LOGO_SIZES[size]

  return (
    <Flex
      inline
      align="center"
      justify="center"
      flex="none"
      size={pxToRem(px)}
      borderRadius="full"
      bg={getToken("tags.soft.purple.background")}
      color={getToken("tags.soft.purple.foreground")}
    >
      <Icon component={Blend} size={px * 0.55} />
    </Flex>
  )
}

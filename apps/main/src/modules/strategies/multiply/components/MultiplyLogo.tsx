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
      bg={getToken("colors.darkBlue.700")}
    >
      <Icon
        component={Blend}
        size={px * 0.55}
        color={getToken("colors.darkBlue.200")}
        sx={{ "& svg": { color: "inherit !important" } }}
      />
    </Flex>
  )
}

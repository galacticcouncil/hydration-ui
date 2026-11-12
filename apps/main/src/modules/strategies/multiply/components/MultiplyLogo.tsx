import { Blend } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  LOGO_SIZES,
  LogoSize,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"

// violet Chip hue (Leverage badge). lavender 200-400 are greys, so shades are
// mixed toward black/white instead of read off the scale
const hue = getToken("colors.lavender.700")

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
      bg={(theme) => `color-mix(in srgb, ${hue(theme)} 35%, black)`}
    >
      <Icon
        component={Blend}
        size={px * 0.55}
        color={(theme) => `color-mix(in srgb, ${hue(theme)}, white 60%)`}
        sx={{ "& svg": { color: "inherit !important" } }}
      />
    </Flex>
  )
}

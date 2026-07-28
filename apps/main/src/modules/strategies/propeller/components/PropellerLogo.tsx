import { LogoSize } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import PropellerLogoSvg from "@/modules/strategies/propeller/assets/propeller-logo.svg?react"

export const LOGO_SIZES = {
  "extra-small": 12,
  small: 18,
  medium: 24,
  large: 36,
  "extra-large": 56,
} as const

type Props = {
  size?: LogoSize
}

export const PropellerLogo = ({ size = "medium" }: Props) => (
  <PropellerLogoSvg
    width={pxToRem(LOGO_SIZES[size])}
    height={pxToRem(LOGO_SIZES[size])}
    style={{ flexShrink: 0 }}
  />
)

import { pxToRem } from "@galacticcouncil/ui/utils"

import PropellerLogoSvg from "@/modules/strategies/propeller/assets/propeller-logo.svg?react"

type Props = {
  size?: number
}

export const PropellerLogo = ({ size = 24 }: Props) => (
  <PropellerLogoSvg
    width={pxToRem(size)}
    height={pxToRem(size)}
    style={{ flexShrink: 0 }}
  />
)

import { pxToRem } from "@galacticcouncil/ui/utils"

import HdclLogoSvg from "@/modules/strategies/hdcl/assets/hdcl-logo.svg?react"

type Props = {
  size?: number
}

export const HdclLogo = ({ size = 24 }: Props) => (
  <HdclLogoSvg
    width={pxToRem(size)}
    height={pxToRem(size)}
    style={{ flexShrink: 0 }}
  />
)

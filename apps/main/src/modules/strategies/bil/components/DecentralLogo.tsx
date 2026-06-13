import { pxToRem } from "@galacticcouncil/ui/utils"

import DecentralLogoSvg from "@/modules/strategies/bil/assets/decentral-logo.svg?react"

type Props = {
  size?: number
}

export const DecentralLogo = ({ size = 32 }: Props) => (
  <DecentralLogoSvg sx={{ flexShrink: 0, size: pxToRem(size) }} />
)

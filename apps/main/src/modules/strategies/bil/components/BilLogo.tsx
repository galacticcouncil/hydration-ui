import { pxToRem } from "@galacticcouncil/ui/utils"

import BilLogoSvg from "@/modules/strategies/bil/assets/bil-logo.svg?react"

type Props = {
  size?: number
}

export const BilLogo = ({ size = 24 }: Props) => (
  <BilLogoSvg
    width={pxToRem(size)}
    height={pxToRem(size)}
    style={{ flexShrink: 0 }}
  />
)

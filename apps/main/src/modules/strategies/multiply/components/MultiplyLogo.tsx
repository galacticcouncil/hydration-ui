import { Blend } from "@galacticcouncil/ui/assets/icons"
import { Icon } from "@galacticcouncil/ui/components"

import { SMultiplyLogo } from "./MultiplyLogo.styled"

export const MultiplyLogo = ({ size }: { size: number }) => (
  <SMultiplyLogo size={size}>
    <Icon component={Blend} size={size * 0.55} />
  </SMultiplyLogo>
)

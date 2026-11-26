import { JuicerLogo } from "@galacticcouncil/ui/assets/icons"
import { LogoSize } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { SJuicerStrategyLogo } from "./JuicerStrategyLogo.styled"

const JUICER_LOGO_PX: Record<LogoSize, number> = {
  "extra-small": 12,
  small: 18,
  medium: 24,
  large: 36,
  "extra-large": 56,
}

type JuicerStrategyLogoProps = {
  size?: LogoSize
  withBackground?: boolean
}

export const JuicerStrategyLogo: FC<JuicerStrategyLogoProps> = ({
  size = "medium",
  withBackground = true,
}) => {
  const px = JUICER_LOGO_PX[size]

  return (
    <SJuicerStrategyLogo
      width={pxToRem(px)}
      height={pxToRem(px)}
      borderRadius="full"
      overflow="hidden"
      data-plain={withBackground ? undefined : ""}
    >
      <JuicerLogo />
    </SJuicerStrategyLogo>
  )
}

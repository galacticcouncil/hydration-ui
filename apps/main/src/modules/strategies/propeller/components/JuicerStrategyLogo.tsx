import { JuicerLogo } from "@galacticcouncil/ui/assets/icons"
import { Box, LogoSize } from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"

const JUICER_LOGO_PX: Record<LogoSize, number> = {
  "extra-small": 12,
  small: 18,
  medium: 24,
  large: 36,
  "extra-large": 56,
}

type JuicerStrategyLogoProps = {
  size?: LogoSize
}

export const JuicerStrategyLogo = ({
  size = "medium",
}: JuicerStrategyLogoProps) => {
  const px = JUICER_LOGO_PX[size]

  return (
    <Box
      borderRadius="full"
      overflow="hidden"
      sx={{
        width: pxToRem(px),
        height: pxToRem(px),
        flexShrink: 0,
        "& svg": { display: "block", width: "100%", height: "100%" },
        "& svg path": { fill: getToken("accents.alertAlt.primary") },
      }}
    >
      <JuicerLogo />
    </Box>
  )
}

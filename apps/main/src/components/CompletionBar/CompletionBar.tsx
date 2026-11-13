import { Box } from "@galacticcouncil/ui/components"
import { FC } from "react"

// A thin bar in currentColor, sized to sit inside a status label or chip.
export const CompletionBar: FC<{ readonly percent: number }> = ({
  percent,
}) => {
  const clipped = Math.min(100, Math.max(0, percent))

  return (
    <Box
      width="2.25rem"
      height="3xs"
      borderRadius="full"
      overflow="hidden"
      position="relative"
      flex="none"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clipped)}
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        left={0}
        sx={{ backgroundColor: "currentColor", opacity: 0.25 }}
      />
      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={0}
        width={`${clipped}%`}
        sx={{ backgroundColor: "currentColor" }}
      />
    </Box>
  )
}

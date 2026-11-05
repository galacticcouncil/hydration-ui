import styled from "@emotion/styled"
import { pxToRem } from "@galacticcouncil/ui/utils"

// ponytail: no violet in the theme tokens; move to hydration-styles if reused
export const SMultiplyLogo = styled.span<{ size: number }>(
  ({ size, theme }) => ({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: pxToRem(size),
    height: pxToRem(size),
    borderRadius: theme.radii.full,
    background: "#2B1A55",
    color: "#B99CFF",
  }),
)

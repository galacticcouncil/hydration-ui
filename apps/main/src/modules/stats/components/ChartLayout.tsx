import styled from "@emotion/styled"
import { css } from "@galacticcouncil/ui/utils"

type SpacingKey = string | number | undefined

const resolveSpacing = (
  theme: { scales?: { paddings?: Record<string, string | number> } },
  value: SpacingKey,
  fallback: string,
) => {
  const resolved = value ?? fallback
  if (typeof resolved === "number") return resolved
  const token = theme.scales?.paddings?.[resolved]
  if (typeof token === "number") return token
  if (typeof token === "string") return parseInt(token, 10) || 0
  return 0
}

type ChartHeaderProps = {
  $direction?: "row" | "column"
  $justify?: "space-between" | "flex-start" | "flex-end" | "center"
  $align?: "center" | "flex-start"
  $wrap?: boolean
  $gap?: SpacingKey
  $marginTop?: SpacingKey
  $marginBottom?: SpacingKey
  $enableMobile?: boolean
  $mobileReverse?: boolean
  $mobileGap?: SpacingKey
  $mobileAlign?: "stretch" | "center" | "flex-start"
  $mobileMarginTop?: SpacingKey
  $mobileMarginBottom?: SpacingKey
}

export const SChartHeader = styled.div<ChartHeaderProps>(
  ({
    theme,
    $direction = "row",
    $justify = "space-between",
    $align = "center",
    $wrap = true,
    $gap,
    $marginTop,
    $marginBottom,
    $enableMobile = true,
    $mobileReverse = true,
    $mobileGap,
    $mobileAlign = "stretch",
    $mobileMarginTop,
    $mobileMarginBottom,
  }) => css`
    display: flex;
    flex-direction: ${$direction};
    justify-content: ${$justify};
    align-items: ${$align};
    ${$wrap ? "flex-wrap: wrap;" : "flex-wrap: nowrap;"}
    gap: ${resolveSpacing(theme, $gap, "m")}px;
    margin-top: ${resolveSpacing(theme, $marginTop, "0")}px;
    margin-bottom: ${resolveSpacing(theme, $marginBottom, "l")}px;

    ${$enableMobile &&
    css`
      @media (max-width: 576px) {
        flex-direction: ${$mobileReverse ? "column-reverse" : "column"};
        align-items: ${$mobileAlign};
        gap: ${resolveSpacing(theme, $mobileGap, "l")}px;
        margin-top: ${resolveSpacing(theme, $mobileMarginTop, "0")}px;
        margin-bottom: ${resolveSpacing(theme, $mobileMarginBottom, "l")}px;
      }
    `}
  `,
)

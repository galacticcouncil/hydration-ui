import styled from "@emotion/styled"
import { mq, ThemeFont } from "@galacticcouncil/ui/theme"
import { createVariants, css } from "@galacticcouncil/ui/utils"

export type ValueStatsSize = "small" | "medium" | "large"
export type ValueStatsFont = Exclude<ThemeFont, "mono">

const containerSizeVariants = createVariants<ValueStatsSize>((theme) => ({
  small: css`
    gap: ${theme.space.xs};
  `,
  medium: css`
    gap: ${theme.space.xs};
  `,
  large: css`
    gap: ${theme.space.s};
  `,
}))

export const SValueStatsValueContainer = styled.div<{
  readonly size?: ValueStatsSize
}>(({ size = "large" }) => [
  css`
    position: relative;
    display: flex;
    flex-direction: column;
  `,
  containerSizeVariants(size),
])

export const SValueStats = styled.div<{
  readonly size?: ValueStatsSize
  readonly shouldWrap: boolean
}>(({ size = "large", shouldWrap }) => [
  shouldWrap
    ? css`
        display: flex;
        flex-direction: column;
      `
    : css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      `,
  containerSizeVariants(size),
])

export const SValueStatsLabel = styled.div(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: ${theme.fontSizes.p6};
    line-height: ${theme.lineHeights.s};
    color: ${theme.text.low};

    white-space: nowrap;

    ${mq("sm")} {
      line-height: 1.4;
      color: ${theme.text.medium};
    }
  `,
)

const valueSizeVariants = createVariants<ValueStatsSize>((theme) => ({
  small: css`
    font-size: ${theme.fontSizes.base};
    line-height: 1;

    ${mq("sm")} {
      font-size: ${theme.fontSizes.h7};
    }
  `,
  medium: css`
    font-size: ${theme.fontSizes.h7};
    line-height: 1;

    ${mq("sm")} {
      font-size: ${theme.fontSizes.h6};
      line-height: ${theme.lineHeights.xl};
    }
  `,
  large: css`
    font-size: ${theme.fontSizes.h7};
    line-height: 1;

    ${mq("sm")} {
      font-size: ${theme.fontSizes.h5};
      line-height: ${theme.lineHeights["2xl"]};
    }
  `,
}))

export const SValueStatsValue = styled.div<{
  readonly size?: ValueStatsSize
  readonly font?: ValueStatsFont
}>(({ theme, size = "large", font = "primary" }) => [
  css`
    font-family: ${theme.fontFamilies1[font]};
    font-weight: 500;

    color: ${theme.text.high};

    white-space: nowrap;
  `,
  valueSizeVariants(size),
])

export const SValueStatsBottomValue = styled.div<{
  isFloating?: boolean
}>(({ theme, isFloating = false }) => [
  css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: ${theme.fontSizes.p6};
    line-height: 1;

    color: ${theme.text.low};

    white-space: nowrap;
  `,
  isFloating &&
    css`
      position: absolute;
      top: calc(100% + ${theme.space.xs});
      left: 0;
    `,
])

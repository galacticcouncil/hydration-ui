import styled from "@emotion/styled"
import { mq, ThemeBaseProps, ThemeFont } from "@galacticcouncil/ui/theme"
import { createVariants, css } from "@galacticcouncil/ui/utils"

export type ValueStatsSize = "small" | "medium" | "large"
export type ValueStatsFont = Exclude<ThemeFont, "mono">
export type ValueStatsAlign = "left" | "right"
export type ValueStatsGroupGap = Exclude<
  keyof ThemeBaseProps["sizes"],
  `-${string}`
>

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
  readonly align?: ValueStatsAlign
}>(({ size = "large", shouldWrap, align = "left" }) => [
  shouldWrap
    ? css`
        display: flex;
        flex-direction: column;
        align-items: ${align === "right" ? "flex-end" : "flex-start"};
      `
    : css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        text-align: ${align === "right" ? "right" : "left"};
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
  readonly isFloating?: boolean
  readonly align?: ValueStatsAlign
}>(({ theme, isFloating = false, align = "left" }) => [
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
      ${align === "right" ? "right: 0;" : "left: 0;"}
    `,
])

export const SValueStatsGroup = styled.div<{
  readonly fullWidth?: boolean
  readonly columnGap?: ValueStatsGroupGap
  readonly rowGap?: ValueStatsGroupGap
}>(
  ({ theme, fullWidth = false, columnGap = "3xl", rowGap = "xl" }) => css`
    display: grid;
    grid-template-columns: repeat(var(--columns, 1), auto);
    justify-content: start;
    column-gap: ${theme.sizes[columnGap]};
    row-gap: ${theme.sizes[rowGap]};
    overflow: hidden;

    & > * {
      position: relative;
      display: flex;
    }

    ${fullWidth &&
    css`
      &:not([data-wrapped]) {
        justify-content: normal;

        & > * {
          justify-content: center;
        }

        & > :first-child {
          justify-content: flex-start;
        }

        & > :last-child:not(:first-child) {
          justify-content: flex-end;
        }
      }
    `}

    & > *::before,
    & > *::after {
      content: "";
      position: absolute;
      background: ${theme.details.separators};
    }

    & > *::before {
      top: 0;
      bottom: 0;
      left: calc(${theme.sizes[columnGap]} / -2);
      width: 1px;
    }

    & > *::after {
      top: calc(${theme.sizes[rowGap]} / -2);
      left: -100vw;
      right: -100vw;
      height: 1px;
    }
  `,
)

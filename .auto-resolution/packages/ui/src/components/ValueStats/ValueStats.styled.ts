import styled from "@emotion/styled"
import { mq } from "@galacticcouncil/ui/theme"
import { createVariants, css } from "@galacticcouncil/ui/utils"

export type ValueStatsSize = "small" | "medium" | "large"

const containerSizeVariants = createVariants<ValueStatsSize>((theme) => ({
  small: css`
    gap: 2px;
  `,
  medium: css`
    gap: ${theme.scales.paddings.xs}px;
  `,
  large: css`
    gap: ${theme.scales.paddings.s}px;
  `,
}))

export const SValueStatsValueContainer = styled.div<{
  readonly size?: ValueStatsSize
}>(({ size = "large" }) => [
  css`
    display: flex;
    flex-direction: column;
  `,
  containerSizeVariants(size),
])

export const SValueStats = styled.div<{
  readonly size?: ValueStatsSize
  readonly alwaysWrap?: boolean
}>(({ size = "large", alwaysWrap }) => [
  alwaysWrap
    ? css`
        display: flex;
        flex-direction: column;
      `
    : css`
        display: flex;
        flex-direction: row;
        justify-content: space-between;

        ${mq("sm")} {
          flex-direction: column;
          justify-content: initial;
        }
      `,
  containerSizeVariants(size),
])

export const SValueStatsLabel = styled.div(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;

    font-size: 11px;
    line-height: 15px;
    color: ${theme.text.low};

    white-space: nowrap;

    ${mq("sm")} {
      font-size: ${theme.paragraphSize.p6};
      line-height: 1.4;
      color: ${theme.text.medium};
    }
  `,
)

const valueSizeVariants = createVariants<ValueStatsSize>((theme) => ({
  small: css`
    font-size: ${theme.headlineSize.base};
    line-height: 1;

    ${mq("sm")} {
      font-size: ${theme.headlineSize.h7};
    }
  `,
  medium: css`
    font-size: ${theme.headlineSize.h7};
    line-height: 1;

    ${mq("sm")} {
      font-size: 22px;
      line-height: 24px;
    }
  `,
  large: css`
    font-size: ${theme.headlineSize.h7};
    line-height: 1;

    ${mq("sm")} {
      font-size: 28px;
      line-height: 30px;
    }
  `,
}))

export const SValueStatsValue = styled.div<{ readonly size?: ValueStatsSize }>(
  ({ theme, size = "large" }) => [
    css`
      font-family: ${theme.fontFamilies1.primary};
      font-weight: 500;

      color: ${theme.text.high};

      white-space: nowrap;
    `,
    valueSizeVariants(size),
  ],
)

export const SValueStatsBottomValue = styled.div(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: 10px;
    line-height: 1;

    color: ${theme.text.low};

    white-space: nowrap;
  `,
)

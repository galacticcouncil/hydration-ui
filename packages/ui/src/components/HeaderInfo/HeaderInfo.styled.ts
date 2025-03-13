import { mq } from "@galacticcouncil/ui/theme"
import { createVariants, css, styled } from "@galacticcouncil/ui/utils"

export type HeaderInfoSize = "small" | "medium" | "large"

const containerSizeVariants = createVariants<HeaderInfoSize>(() => ({
  small: css`
    gap: 2px;
  `,
  medium: css`
    gap: 4px;
  `,
  large: css`
    gap: 4px;
  `,
}))

export const SHeaderInfo = styled.div<{ readonly size?: HeaderInfoSize }>(
  ({ size = "large" }) => [
    css`
      display: flex;
      flex-direction: row;

      ${mq("sm")} {
        flex-direction: column;
        justify-content: initial;
      }
    `,
    containerSizeVariants(size),
  ],
)

export const SHeaderInfoLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;

    font-size: 11px;
    line-height: 15px;
    color: ${theme.text.low};

    ${mq("sm")} {
      font-size: ${theme.paragraphSize.p6};
      line-height: 1.4;
      color: ${theme.text.medium};
    }
  `,
)

const valueSizeVariants = createVariants<HeaderInfoSize>((theme) => ({
  small: css`
    font-size: ${theme.headlineSize.h7}px;
    line-height: 1;

    ${mq("sm")} {
      font-size: 17.5px;
    }
  `,
  medium: css`
    font-size: ${theme.headlineSize.h7}px;

    ${mq("sm")} {
      font-size: 22px;
      line-height: 24px;
    }
  `,
  large: css`
    font-size: ${theme.headlineSize.h7}px;

    ${mq("sm")} {
      font-size: 28px;
      line-height: 30px;
    }
  `,
}))

export const SHeaderInfoValue = styled.span<{ readonly size?: HeaderInfoSize }>(
  ({ theme, size = "large" }) => [
    css`
      font-family: ${theme.fontFamilies1.primary};
      font-weight: 500;
      font-size: ${theme.headlineSize.h7}px;

      color: ${theme.text.high};
    `,
    valueSizeVariants(size),
  ],
)

export const SHeaderInfoBottomLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;

    font-size: 12px;
    line-height: 1;
    color: #aeb0b7;
  `,
)

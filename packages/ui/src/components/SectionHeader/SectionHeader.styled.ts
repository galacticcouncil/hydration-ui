import { Box } from "@/components/Box"
import { mq } from "@/styles/media"
import { css, styled } from "@/utils"

export const SSectionHeaderContainer = styled.div<{
  readonly hasDescription?: boolean
  readonly noTopPadding?: boolean
}>(
  ({ theme, hasDescription, noTopPadding }) => css`
    display: flex;
    justify-content: space-between;
    align-items: end;
    padding-top: ${noTopPadding ? 0 : theme.space.xl};
    padding-bottom: ${hasDescription ? 0 : theme.containers.paddings.secondary};

    ${mq("sm")} {
      align-items: center;
      padding-top: ${noTopPadding ? 0 : theme.space.xxl};
      padding-bottom: ${hasDescription
        ? 0
        : theme.containers.paddings.tertiary};
    }
  `,
)

export const SSectionHeaderTitle = styled(Box)<{
  readonly hasDescription?: boolean
}>(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.primary};
    font-size: ${theme.fontSizes.base};
    font-weight: 500;
    line-height: ${theme.lineHeights.xl};

    color: ${theme.text.high};

    ${mq("sm")} {
      font-size: ${theme.fontSizes.h7};
      line-height: ${theme.lineHeights["2xl"]};
    }
  `,
)

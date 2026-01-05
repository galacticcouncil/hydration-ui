import { Box } from "@/components/Box"
import { mq } from "@/styles/media"
import { css, styled } from "@/utils"

export const SSectionHeaderContainer = styled.div<{
  readonly hasDescription?: boolean
}>(
  ({ theme, hasDescription }) => css`
    display: flex;
    justify-content: space-between;
    align-items: end;
    padding-top: ${theme.containers.paddings.primary}px;
    padding-bottom: ${hasDescription
      ? 0
      : theme.containers.paddings.secondary}px;

    ${mq("sm")} {
      align-items: center;
      padding-top: ${theme.scales.paddings.xxl};
      padding-bottom: ${hasDescription
        ? 0
        : theme.containers.paddings.tertiary}px;
    }
  `,
)

export const SSectionHeaderTitle = styled(Box)<{
  readonly hasDescription?: boolean
}>(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.primary};
    font-size: 14px;
    font-weight: 500;
    line-height: 15px;

    color: ${theme.text.high};

    ${mq("sm")} {
      font-size: 17.5px;
      line-height: 21px;
    }
  `,
)

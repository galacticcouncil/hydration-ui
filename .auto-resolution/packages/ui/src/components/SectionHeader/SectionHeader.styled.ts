import { mq } from "@/styles/media"
import { css, styled } from "@/utils"

export const SSectionHeader = styled.div(
  ({ theme }) => css`
    padding: ${theme.scales.paddings.xl}px ${theme.containers.paddings.quint}px
      ${theme.containers.paddings.secondary}px
      ${theme.containers.paddings.quint}px;

    font-family: ${theme.fontFamilies1.primary};
    font-size: 14px;
    line-height: 15px;

    color: ${theme.text.high};

    ${mq("sm")} {
      padding-inline: 0;
      padding-top: ${theme.containers.paddings.primary}px;
      padding-bottom: ${theme.containers.paddings.tertiary}px;

      font-weight: 500;
      font-size: 17.5px;
      line-height: 21px;
    }
  `,
)

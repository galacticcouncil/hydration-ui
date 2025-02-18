import { mq } from "@galacticcouncil/ui/theme"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SHeaderInfoLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;

    font-size: 11px;
    line-height: 15px;
    color: ${theme.text.low};

    ${mq("sm")} {
      font-size: ${theme.paragraphSize.p6};
      line-height: 15.4px;
      color: ${theme.text.medium};
    }
  `,
)

export const SHeaderInfoValue = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.primary};
    font-weight: 500;
    font-size: ${theme.headlineSize.h7};
    line-height: 17.5px;

    color: ${theme.text.high};

    ${mq("sm")} {
      font-size: 28px;
      line-height: 30px;
    }
  `,
)

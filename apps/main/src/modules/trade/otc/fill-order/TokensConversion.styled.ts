import { css, styled } from "@galacticcouncil/ui/utils"

export const STokensConversionPrice = styled.span(
  ({ theme }) => css`
    padding: 5px 14px;
    border-radius: 16px;
    background-color: ${theme.details.separators};

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.paragraphSize.p6};
    line-height: 15.4px;
    color: ${theme.text.high};

    align-content: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    backdrop-filter: blur(3px);
  `,
)

import { css, styled } from "@/utils"

export const SRoot = styled.div(
  ({ theme }) => css`
    position: relative;

    code {
      font-family: GeistMono;
      font-size: inherit;

      --json-property: ${theme.text.high};
      --json-index: ${theme.text.low};
      --json-number: ${theme.colors.azureBlue[500]};
      --json-string: ${theme.colors.azureBlue[500]};
      --json-boolean: ${theme.colors.coral[900]};
      --json-null: ${theme.text.medium};
    }
  `,
)

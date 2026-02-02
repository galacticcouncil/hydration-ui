import { css, styled } from "@/utils"

export const SRoot = styled.div(
  ({ theme }) => css`
    position: relative;

    pre,
    code {
      min-height: 1.5rem
      font-family: GeistMono;
      font-size: inherit;

      --json-property: ${theme.text.high};
      --json-index: ${theme.text.low};
      --json-number: ${theme.colors.azureBlue[500]};
      --json-string: ${theme.colors.azureBlue[500]};
      --json-boolean: ${theme.colors.coral[900]};
      --json-null: ${theme.text.medium};

      opacity: 0;
      animation: ${theme.animations.fadeIn} 0.2s ease forwards;
    }

    pre {
      position: relative;
      color: transparent;
      > svg {
        color: ${theme.text.medium};

        position: absolute;
        top: 50%;
        left: 50%;

        width: 20px;
        height: 20px;

        margin-left: -10px;
        margin-top: -10px;
      }
    }
  `,
)

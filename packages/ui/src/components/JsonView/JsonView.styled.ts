import { css, styled } from "@/utils"

export const SRoot = styled.div(
  ({ theme }) => css`
    position: relative;

    pre,
    code {
      min-height: 1.5rem
      font-family: GeistMono;
      font-size: inherit;
      font-weight: 600;

      color: ${theme.text.low};

      --json-property: ${theme.text.high};
      --json-index: ${theme.text.low};
      --json-number: ${theme.colors.azureBlue[500]};
      --json-string: ${theme.colors.azureBlue[500]};
      --json-boolean: ${theme.colors.coral[900]};
      --json-null: ${theme.text.medium};

      opacity: 0;
      animation: ${theme.animations.fadeIn} 0.2s ease forwards;
    }

    .json-view {
      &--string {
        word-break: break-all;
      }

      .jv-indent {
        margin-left: 0.2rem;
        padding-left: 1.2rem;
        border-left: 1px solid ${theme.details.separatorsOnDim};
      }
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

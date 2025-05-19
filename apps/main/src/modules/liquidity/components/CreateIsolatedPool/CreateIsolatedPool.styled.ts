import { css } from "@emotion/react"
import { ButtonTransparent } from "@galacticcouncil/ui/components"
import { styled } from "@galacticcouncil/ui/utils"

export const SRate = styled(ButtonTransparent)(
  ({ theme }) => css`
    border-radius: ${theme.containers.cornerRadius.containersPrimary}px;

    transition: ${theme.transitions.colors};

    padding: 2px 14px;

    height: 28px;

    font-size: ${theme.paragraphSize.p6};
    color: ${theme.text.high};

    background: ${theme.details.separators};

    &:hover:not([disabled]) {
      opacity: 0.2;
    }

    &[disabled] {
      cursor: not-allowed;
    }
  `,
)

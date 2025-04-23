import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-collapsible"

import { ButtonTransparent } from "../Button"

export const STrigger = styled(ButtonTransparent)(
  ({ theme }) => css`
    width: 100%;
    display: block;

    &[data-state="open"] svg {
      transition: ${theme.transitions.transform};

      transform: rotate(180deg);
    }

    &[data-state="closed"] svg {
      transition: ${theme.transitions.transform};

      transform: rotate(0deg);
    }
  `,
)

export const SContent = styled(Content)(
  ({ theme }) => css`
    overflow: hidden;

    @keyframes slideDown {
      from {
        height: 0;
      }
      to {
        height: var(--radix-collapsible-content-height);
      }
    }

    @keyframes slideUp {
      from {
        height: var(--radix-collapsible-content-height);
      }
      to {
        height: 0;
      }
    }

    transition: ${theme.transitions.transform};

    &[data-state="open"] {
      animation: slideDown 0.15s ${theme.easings.easeInOut};
    }

    &[data-state="closed"] {
      animation: slideUp 0.15s ${theme.easings.easeInOut};
    }
  `,
)

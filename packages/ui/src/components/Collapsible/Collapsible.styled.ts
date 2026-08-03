import isPropValid from "@emotion/is-prop-valid"
import { css, keyframes } from "@emotion/react"
import styled from "@emotion/styled"
import { Content } from "@radix-ui/react-collapsible"

import { ButtonTransparent } from "../Button"

export const SActionLabel = styled.span()
export const SActionLabelWhenOpen = styled.span()

export const SCollapsibleTrigger = styled(ButtonTransparent)(
  ({ theme }) => css`
    width: 100%;
    display: block;

    svg {
      transition: ${theme.transitions.transform};
      transition-duration: 0.2s;
    }

    &:hover,
    &:hover p,
    &:hover svg {
      color: ${theme.accents.info.onPrimary};
    }

    &[data-state="open"] {
      ${SActionLabel} {
        display: none;
      }
      svg {
        transform: rotate(180deg);
      }
    }

    &[data-state="closed"] {
      ${SActionLabelWhenOpen} {
        display: none;
      }
      svg {
        transform: rotate(0deg);
      }
    }
  `,
)

const slideDown = keyframes`
  from {
    height: 0;
  }
  to {
    height: var(--radix-collapsible-content-height);
  }
`

const slideUp = keyframes`
  from {
    height: var(--radix-collapsible-content-height);
  }
  to {
    height: 0;
  }
`

export const SCollapsibleContent = styled(Content, {
  shouldForwardProp: (prop) =>
    isPropValid(prop) && prop !== "animationDurationMs",
})<{ animationDurationMs?: number }>(
  ({ theme, animationDurationMs = 200 }) => css`
    overflow: visible;
    will-change: height;

    &[data-state="open"] {
      animation: ${slideDown} ${animationDurationMs}ms ${theme.easings.outQuint};
    }

    &[data-state="closed"] {
      overflow: hidden;
      animation: ${slideUp} ${animationDurationMs}ms ${theme.easings.outQuint}
        forwards;
    }
  `,
)

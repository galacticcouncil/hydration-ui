import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SMethodCard = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    display: flex;
    flex-direction: column;
    text-align: left;
    width: 100%;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: 8px;

    padding: 16px 12px;

    cursor: pointer;

    transition: ${theme.transitions.colors};

    ${active
      ? css`
          background-color: ${theme.buttons.secondary.outline.fill};
          border-color: ${theme.buttons.secondary.outline.outline};
        `
      : css`
          &:hover:not(:disabled) {
            background-color: ${theme.buttons.outlineDark.rest};
          }
        `}

    &:disabled {
      cursor: unset;
      opacity: 0.6;
    }
  `,
)

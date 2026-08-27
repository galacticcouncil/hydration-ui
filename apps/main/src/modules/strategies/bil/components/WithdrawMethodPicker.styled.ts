import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SMethodCard = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    display: flex;
    flex-direction: column;
    text-align: left;
    width: 100%;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: ${theme.radii.m};

    padding: ${theme.space.l} ${theme.space.m};

    cursor: pointer;

    transition: ${theme.transitions.colors};

    ${active
      ? css`
          border-color: ${theme.buttons.secondary.outline.outline};
          background-color: ${theme.controls.dim.active};
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

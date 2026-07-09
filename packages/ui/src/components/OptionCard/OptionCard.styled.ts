import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SOptionCardContainer = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.space.base};
    width: 100%;
    height: 4rem;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: ${theme.radii.m};

    padding: ${theme.space.l} ${theme.space.m};

    cursor: pointer;

    transition: ${theme.transitions.colors};

    ${active
      ? css`
          border-color: ${theme.buttons.secondary.outline.outline};
          background-color: ${theme.controls.dim.active};
          svg {
            color: ${theme.text.tint.quart};
          }
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

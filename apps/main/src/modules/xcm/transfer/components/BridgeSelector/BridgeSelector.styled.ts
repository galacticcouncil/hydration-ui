import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SBridgeOption = styled.button<{ active: boolean }>(
  ({ theme, active }) => css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.space.base};

    position: relative;
    overflow: hidden;

    border: 1px solid ${theme.buttons.outlineDark.onOutline};
    border-radius: ${theme.radii.m};

    padding-block: ${theme.space.l};
    padding-inline: ${theme.space.m};

    cursor: pointer;

    transition: ${theme.transitions.colors};

    ${active
      ? css`
          background-color: ${theme.controls.dim.active};
          border-color: ${theme.controls.dim.active};
        `
      : css`
          &:hover:not(:disabled) {
            background-color: ${theme.buttons.outlineDark.rest};
          }
        `}
  `,
)

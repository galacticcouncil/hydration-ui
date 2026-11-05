import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SPairOption = styled.button<{ selected: boolean }>(
  ({ theme, selected }) => css`
    all: unset;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${theme.space.m};
    width: 100%;

    padding: ${theme.space.m} var(--modal-content-padding);
    border-top: 1px solid ${theme.details.separators};
    cursor: pointer;

    &:first-of-type {
      border-top: none;
    }

    ${selected &&
    css`
      background: ${theme.surfaces.containers.dim.dimOnBg};
    `}

    &:hover,
    &:focus-visible {
      background: ${theme.surfaces.containers.dim.dimOnBg};
    }
  `,
)

import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Root, Thumb, Track } from "@radix-ui/react-slider"

export const SRoot = styled(Root)`
  position: relative;
  width: 100%;
  height: 24px;

  display: flex;
  align-items: center;

  user-select: none;
  touch-action: none;

  &[data-disabled] {
    filter: grayscale(1);
  }
`

export const SRange = styled.div(
  ({ theme }) => css`
    position: absolute;
    height: 100%;

    background: ${theme.text.tint.secondary};

    border-radius: ${theme.radii.full};
  `,
)

export const STrack = styled(Track)(
  ({ theme }) => css`
    position: relative;
    height: 4px;

    flex-grow: 1;

    background-color: ${theme.controls.dim.accent};
    border-radius: ${theme.radii.full};
  `,
)

export const SThumb = styled(Thumb)(
  ({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 32px;

    box-shadow:
      0px 0px 17.2px 0px rgba(0, 0, 0, 0.13),
      0px 4px 2.8px 0px rgba(0, 0, 0, 0.71);

    background: ${theme.text.tint.secondary};
    border-radius: 12px;
    transition: all ${theme.transitions.transform};

    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      transform: scale(0.9);
    }

    &[data-disabled] {
      cursor: unset;
    }
  `,
)

export const SDash = styled.div<{
  row: "top" | "bottom"
  offset: number
}>(
  ({ theme, row, offset }) => css`
    position: absolute;
    ${row === "top" ? `top: 0;` : `bottom: 0;`};
    ${offset ? `left: ${offset}px;` : "left: 0;"};

    height: 3px;
    width: 1px;

    background-color: ${theme.controls.dim.accent};
  `,
)

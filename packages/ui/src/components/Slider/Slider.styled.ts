import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Root, Thumb, Track } from "@radix-ui/react-slider"

export type SliderVariant = "default" | "accent"

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

export const SRange = styled.div<{ $variant: SliderVariant }>(
  ({ theme, $variant }) => css`
    position: absolute;
    height: 100%;

    background: ${$variant === "accent"
      ? theme.controls.solid.accent
      : theme.text.tint.secondary};

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

export const SThumb = styled(Thumb)<{ $variant: SliderVariant }>(
  ({ theme, $variant }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 30px;
    height: 32px;

    box-shadow:
      0 0 17.2px 0 rgba(0, 0, 0, 0.03),
      0 4px 2.8px 0 rgba(0, 0, 0, 0.1);

    background: ${$variant === "accent"
      ? theme.controls.solid.accent
      : theme.text.tint.secondary};
    border-radius: 12px;
    transition:
      transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow ${theme.transitions.transform};

    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    &:hover {
      transform: scale(1.06);
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

import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Root, Thumb, Track } from "@radix-ui/react-slider"

import { pxToRem } from "@/utils"

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

    background: ${theme.controls.solid.accent};

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

    width: 16px;
    height: 16px;

    background: ${theme.controls.solid.accent};
    border-radius: ${theme.radii.full};
    transition: box-shadow ${theme.transitions.transform};

    cursor: grab;

    & > span {
      display: none;
    }

    &:hover,
    &:focus-visible,
    &:active {
      box-shadow: 0 0 0 4px
        color-mix(in srgb, ${theme.controls.solid.accent} 30%, transparent);
    }

    &:active {
      cursor: grabbing;
    }

    &[data-disabled] {
      cursor: unset;
      box-shadow: none;
    }

    @media (pointer: coarse) {
      width: 30px;
      height: 32px;

      box-shadow:
        0 0 17.2px 0 rgba(0, 0, 0, 0.03),
        0 4px 2.8px 0 rgba(0, 0, 0, 0.1);

      border-radius: 12px;
      transition: all ${theme.transitions.transform};

      & > span {
        display: inline-flex;
      }

      &:hover,
      &:focus-visible,
      &:active {
        box-shadow:
          0 0 17.2px 0 rgba(0, 0, 0, 0.03),
          0 4px 2.8px 0 rgba(0, 0, 0, 0.1);
      }

      &:hover {
        transform: scale(0.9);
      }
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

export const SMarks = styled.div(
  ({ theme }) => css`
    position: relative;
    height: ${pxToRem(24)};
    margin-top: -${theme.space.s};
  `,
)

export const SMark = styled.div<{ position: number }>(
  ({ position }) => css`
    position: absolute;
    top: 0;
    left: ${position}%;
    transform: translateX(-50%);
  `,
)

export const SMarkTick = styled.div<{ labelled: boolean }>(
  ({ theme, labelled }) => css`
    width: 1px;
    height: ${labelled ? theme.space.base : theme.space.s};

    background-color: ${labelled ? theme.text.low : theme.controls.dim.accent};
  `,
)

export const SMarkLabel = styled.span<{ align: "start" | "center" | "end" }>(
  ({ theme, align }) => css`
    position: absolute;
    top: ${theme.space.m};
    left: 0;
    transform: translateX(
      ${align === "start" ? "0" : align === "end" ? "-100%" : "-50%"}
    );

    font-size: ${theme.fontSizes.p6};
    line-height: 1;
    white-space: nowrap;
    color: ${theme.text.low};
  `,
)

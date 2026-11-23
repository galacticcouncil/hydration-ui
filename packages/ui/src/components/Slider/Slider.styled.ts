import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Root, Thumb, Track } from "@radix-ui/react-slider"

import { pxToRem } from "@/utils"

export const SRoot = styled(Root)`
  position: relative;
  z-index: 1;
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

export const SThumbHandle = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;

    width: 16px;
    height: 16px;

    background: ${theme.controls.solid.accent};
    border-radius: ${theme.radii.full};
    transition: box-shadow ${theme.transitions.transform};

    & > span {
      display: none;
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
    }
  `,
)

// Zero-size thumb: Radix insets the thumb by its measured size to keep it in
// bounds; at 0 it doesn't, so the handle centers exactly on value% and
// overflows the track ends by half its width.
export const SThumb = styled(Thumb)(
  ({ theme }) => css`
    all: unset;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 0;
    height: 0;

    cursor: grab;

    &:hover
      > ${SThumbHandle},
      &:focus-visible
      > ${SThumbHandle},
      &:active
      > ${SThumbHandle} {
      box-shadow: 0 0 0 4px
        color-mix(in srgb, ${theme.controls.solid.accent} 30%, transparent);
    }

    &:active {
      cursor: grabbing;
    }

    &[data-disabled] {
      cursor: unset;

      & > ${SThumbHandle} {
        box-shadow: none;
      }
    }

    @media (pointer: coarse) {
      &:hover
        > ${SThumbHandle},
        &:focus-visible
        > ${SThumbHandle},
        &:active
        > ${SThumbHandle} {
        box-shadow:
          0 0 17.2px 0 rgba(0, 0, 0, 0.03),
          0 4px 2.8px 0 rgba(0, 0, 0, 0.1);
      }

      &:hover > ${SThumbHandle} {
        transform: scale(0.9);
      }
    }
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
    left: round(${position}%, 1px);
  `,
)

export const SMarkTick = styled.div<{ labelled: boolean }>(
  ({ theme, labelled }) => css`
    width: 1px;
    /* rem heights turn fractional under the UI scale; snap them like the left */
    height: round(${labelled ? theme.space.base : theme.space.s}, 1px);

    background-color: ${theme.text.low};
    opacity: ${labelled ? 0.8 : 0.45};
  `,
)

export const SMarkLabel = styled.span<{ align: "start" | "center" | "end" }>(
  ({ theme, align }) => css`
    position: absolute;
    top: ${theme.space.m};
    left: 0;
    transform: translateX(
      ${align === "start"
        ? `calc(-1 * ${theme.space.s})`
        : align === "end"
          ? `calc(-100% + ${theme.space.s})`
          : "-50%"}
    );

    font-size: ${theme.fontSizes.p6};
    line-height: 1;
    white-space: nowrap;
    color: ${theme.text.low};
  `,
)

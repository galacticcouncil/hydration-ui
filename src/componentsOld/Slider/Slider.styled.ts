import styled from "@emotion/styled"
import { Range, Root, Thumb, Track } from "@radix-ui/react-slider"
import { theme } from "theme"

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

export const SRange = styled(Range)`
  position: absolute;
  height: 100%;

  background-color: ${theme.colors.primary400};
  border-radius: 9999px;
`

export const STrack = styled(Track)`
  position: relative;
  height: 4px;

  flex-grow: 1;

  background-color: ${theme.colors.backgroundGray600};
  border-radius: 9999px;
`

export const SThumb = styled(Thumb)`
  all: unset;
  display: block;
  width: 20px;
  height: 20px;

  background: ${theme.gradients.primaryGradient};
  border-radius: 50%;
  border: 7px solid ${theme.colors.backgroundGray1000};
  box-shadow: 0 1px 9px rgba(${theme.rgbColors.primary300}, 0.5);
  transition: all ${theme.transitions.default};

  &:hover {
    cursor: pointer;
    box-shadow: 0 1px 9px ${theme.colors.primary300};
  }

  &[data-disabled] {
    cursor: unset;
    box-shadow: none;
  }
`

export const SDash = styled.div<{
  row: "top" | "bottom"
  offset: number
}>`
  position: absolute;
  ${({ row }) => (row === "top" ? `top: 0;` : `bottom: 0;`)};
  ${({ offset }) => `left: ${offset}px;`};

  height: 3px;
  width: 1px;

  background-color: ${theme.colors.backgroundGray600};
`

import styled from "@emotion/styled"
import { Root, Thumb, Track } from "@radix-ui/react-slider"
import { ColorKey, GradientKey } from "./Slider"
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

const isGradient = (color: string): color is GradientKey =>
  color in theme.gradients

const isColor = (color: string): color is ColorKey => color in theme.gradients

export const SRange = styled.div<{
  color: GradientKey | ColorKey
}>`
  position: absolute;
  height: 100%;

  background: ${({ color }) =>
    isGradient(color)
      ? theme.gradients[color]
      : isColor(color)
        ? theme.colors[color]
        : theme.colors.brightBlue600};

  border-radius: 9999px;
`

export const STrack = styled(Track)`
  position: relative;
  height: 4px;

  flex-grow: 1;

  background-color: rgba(84, 99, 128, 0.35);
  border-radius: 9999px;
`

export const SThumb = styled(Thumb)<{ size: number }>`
  all: unset;
  display: block;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;

  background: rgba(146, 209, 247, 0.2);
  border-radius: 50%;
  backdrop-filter: blur(2px);
  transition: all ${theme.transitions.default};

  cursor: grab;

  :before {
    content: "";
    position: absolute;

    border-radius: 50%;

    width: ${({ size }) => size / 2}px;
    height: ${({ size }) => size / 2}px;

    background: ${theme.colors.brightBlue200};

    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.53);

    transform: translate(50%, 50%);
  }

  &:active {
    cursor: grabbing;
  }

  &:hover {
    :before {
      transform: scale(1.1) translate(46%, 46%);
    }
  }

  &[data-disabled] {
    cursor: unset;
    box-shadow: none;
  }
`

export const SDash = styled.div<{
  row: "top" | "bottom"
  $offset: number
}>`
  position: absolute;
  ${({ row }) => (row === "top" ? `top: 0;` : `bottom: 0;`)};
  ${({ $offset }) => `left: ${$offset}px;`};

  height: 5px;
  width: 1px;

  color: ${theme.colors.darkBlue300};
  font-size: 11px;

  background-color: ${theme.colors.darkBlue400};
`

export const SDashValue = styled.span<{
  $offset: number
}>`
  display: block;

  position: absolute;
  top: 26px;

  font-size: 11px;
  color: ${theme.colors.darkBlue300};
  text-align: center;

  ${({ $offset }) => `left: ${$offset}px;`};

  transform: translateX(-50%);
`

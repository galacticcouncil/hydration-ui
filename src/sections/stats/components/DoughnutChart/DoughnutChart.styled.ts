import { css } from "@emotion/react"
import styled from "@emotion/styled"

export const SClipPath = styled.div<{
  clipPath?: string
  hoverClipPath?: string
  rotate: number
  color: string
  length: number
  radial?: boolean
  size: number
  isActive?: boolean
}>`
  position: absolute;
  transform: rotate(${(p) => p.rotate}deg);

  width: ${(p) => p.size}px;
  height: ${(p) => p.size}px;

  ${(p) =>
    p.radial
      ? css`
          background: radial-gradient(circle, transparent 50%, ${p.color} 90%);
        `
      : p.hoverClipPath
        ? css`
            background: conic-gradient(
              from 0deg,
              transparent 0deg,
              ${p.color} ${p.length / 2}deg ${p.length}deg,
              transparent 0deg
            );
          `
        : css`
            mask-image: linear-gradient(
              340deg,
              white 0%,
              rgba(217, 217, 217, 0) 100%
            );

            background: ${p.color};
          `}

  clip-path: path("${(p) => p.clipPath}");

  transition: clip-path 0.3s;

  ${(p) =>
    p.hoverClipPath &&
    p.isActive &&
    css`
      clip-path: path("${p.hoverClipPath}");
      cursor: pointer;
    `}
`

export const SSliceContainer = styled.div<{ size: number }>`
  display: flex;
  justify-content: center;
  align-items: center;

  position: absolute;

  ${(p) => css`
    width: ${p.size}px;
    height: ${p.size}px;
  `}
`

export const SLabelContainer = styled.div<{ size: number }>`
  ${(p) => css`
    width: ${p.size}px;
    height: ${p.size}px;
  `}

  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;
`

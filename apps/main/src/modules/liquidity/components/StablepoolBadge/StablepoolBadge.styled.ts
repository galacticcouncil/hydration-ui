import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { pxToRem } from "@galacticcouncil/ui/utils"

export const Pill = styled.div<{ disableAnimation?: boolean }>(
  ({ theme, disableAnimation }) => css`
    display: inline-grid;
    grid-template-columns: auto 0fr;
    justify-content: start;
    align-items: center;
    inline-size: fit-content;
    flex-shrink: 0;
    min-inline-size: ${theme.sizes.s};
    block-size: ${theme.sizes.s};

    overflow: clip;
    border-radius: ${theme.radii.full};
    background: ${theme.buttons.primary.high.rest};
    color: oklch(1 0 none);

    font-size: ${theme.fontSizes.p5};
    font-weight: 700;
    font-family: ${theme.fontFamilies1.primary};
    line-height: 1;
    white-space: nowrap;

    cursor: pointer;

    @media (prefers-reduced-motion: no-preference) {
      transition: grid-template-columns 0.4s ${theme.easings.outQuint};
    }

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        grid-template-columns: auto 1fr;
      }
    }

    ${disableAnimation &&
    css`
      pointer-events: none;
    `}
  `,
)

export const Initial = styled.span`
  padding-inline-start: ${pxToRem(3)};
  line-height: 1.3;
`

export const Rest = styled.span(
  ({ theme }) => css`
    min-inline-size: 0;
    overflow: clip;
    opacity: 0;
    transition: opacity 0.15s ${theme.easings.outQuint};
    line-height: 1.3;

    & > span {
      display: block;
      padding-inline-end: ${theme.space.s};
    }

    @media (hover: hover) and (pointer: fine) {
      ${Pill}:hover & {
        opacity: 1;
        transition: opacity 0.3s ${theme.easings.outQuint} 0.05s;
      }
    }
  `,
)

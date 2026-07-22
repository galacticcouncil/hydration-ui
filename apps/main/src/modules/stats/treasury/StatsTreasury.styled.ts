import { Flex } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

const COMPOSITION_ROW_HEIGHT = pxToRem(48 * 1.3)
const COMPOSITION_ROW_HEIGHT_MOBILE = pxToRem(52)
const COMPOSITION_GRID_GAP = pxToRem(4)
const COMPOSITION_BLOCK_BORDER_WIDTH = 1
const COMPOSITION_BLOCK_PADDING = pxToRem(8)
const COMPOSITION_BLOCK_HOVER_OUT_DURATION = "720ms"
const COMPOSITION_BLOCK_HOVER_EASING = "cubic-bezier(0.4, 0, 0.2, 1)"
const COMPOSITION_BLOCK_HOVER_TRANSITION = `opacity ${COMPOSITION_BLOCK_HOVER_OUT_DURATION} ${COMPOSITION_BLOCK_HOVER_EASING}, filter ${COMPOSITION_BLOCK_HOVER_OUT_DURATION} ${COMPOSITION_BLOCK_HOVER_EASING}`
const COMPOSITION_BLOCK_BORDER_HOVER_TRANSITION = `opacity ${COMPOSITION_BLOCK_HOVER_OUT_DURATION} ${COMPOSITION_BLOCK_HOVER_EASING}, border-color ${COMPOSITION_BLOCK_HOVER_OUT_DURATION} ${COMPOSITION_BLOCK_HOVER_EASING}, filter ${COMPOSITION_BLOCK_HOVER_OUT_DURATION} ${COMPOSITION_BLOCK_HOVER_EASING}`
const COMPOSITION_GRID_COLUMNS = 12
const COMPOSITION_GRID_COLUMNS_MOBILE = 2

export const SCompositionBlock_ = styled(Flex)<{
  readonly colSpan: number
  readonly rowSpan: number
  readonly backgroundColor: string
}>(
  ({ theme, colSpan, rowSpan, backgroundColor }) => css`
    position: relative;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    align-self: stretch;
    height: 100%;
    min-height: 0;
    grid-column: span ${Math.min(colSpan, COMPOSITION_GRID_COLUMNS)};
    grid-row: span ${rowSpan};
    padding: ${COMPOSITION_BLOCK_PADDING};
    border-radius: ${theme.radii.m};
    cursor: pointer;
    overflow: hidden;
    isolation: isolate;
    animation: ${theme.animations.fadeIn} 180ms ease-out both;

    & > * {
      position: relative;
      z-index: 2;
    }

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: ${backgroundColor};
      opacity: 0.3;
      filter: saturate(1.1) brightness(0.94);
      transition: ${COMPOSITION_BLOCK_HOVER_TRANSITION};
      z-index: 0;
    }

    html.dark &::before {
      opacity: 0.5;
      filter: saturate(1.1) brightness(0.94) invert(0.2);
    }

    html.dark &::after {
      opacity: 0.6;
      filter: saturate(1.1) brightness(0.94) invert(0.2);
    }

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      border: ${COMPOSITION_BLOCK_BORDER_WIDTH}px solid ${backgroundColor};
      opacity: 0.45;
      filter: saturate(1.1) brightness(0.94);
      pointer-events: none;
      z-index: 1;
      transition: ${COMPOSITION_BLOCK_BORDER_HOVER_TRANSITION};
    }

    &:hover {
      z-index: 2;

      &::before {
        opacity: 0.4;
      }

      &::after {
        opacity: 0.55;
      }
    }
  `,
)

export const SCompositionGrid = styled.div(
  () => css`
    display: grid;
    grid-template-columns: repeat(
      ${COMPOSITION_GRID_COLUMNS_MOBILE},
      minmax(0, 1fr)
    );
    grid-auto-rows: ${COMPOSITION_ROW_HEIGHT_MOBILE};
    grid-auto-flow: dense;
    gap: ${COMPOSITION_GRID_GAP};

    ${mq("sm")} {
      grid-template-columns: repeat(
        ${COMPOSITION_GRID_COLUMNS},
        minmax(0, 1fr)
      );
      grid-auto-rows: ${COMPOSITION_ROW_HEIGHT};
    }
  `,
)

export const SCompositionOthersLogos = styled.div(
  () => css`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 0;

    & > * + * {
      margin-left: -6px;
    }
  `,
)

export const STooltipTitle = styled.span(
  ({ theme }) => css`
    display: block;
    width: 100%;
    color: ${theme.text.medium};
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p6};
    font-weight: 600;
    line-height: ${theme.lineHeights.m};
    margin-bottom: calc(${theme.space.base} * -0.5);
    text-transform: uppercase;
  `,
)

export const STooltipRow = styled.div(
  ({ theme }) => css`
    display: flex;
    justify-content: space-between;
    align-items: start;
    gap: ${theme.space.base};
    padding: ${theme.space.s} 0;
    min-width: 0;
    border-bottom: 1px solid ${theme.details.separatorsOnDim};

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  `,
)

export const STooltipSection = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};
    padding: ${theme.space.base} 0;
    width: 100%;
    min-width: 0;
    background: ${theme.surfaces.containers.dim.dimOnHigh};
    border-radius: ${theme.radii.m};
    overflow: hidden;

    > div {
      padding: 0 ${theme.space.base};
      border-bottom: none;
    }

    > div + div {
      padding-top: ${theme.space.s};
      border-top: 1px solid ${theme.details.separatorsOnDim};
    }
  `,
)

export const STooltipValues = styled(Flex)(
  ({ theme }) => css`
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    gap: ${theme.space.xs};
    text-align: right;
    white-space: nowrap;
    line-height: 1.1;
  `,
)

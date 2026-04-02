import { Box, Button } from "@galacticcouncil/ui/components"
import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

import { hiddenStyles } from "@/modules/layout/components/Footer.styled"

export const SGigaNewsToggleButton = styled(Button)(
  ({ theme }) => css`
    color: ${theme.text.high};
    text-transform: uppercase;

    transition:
      filter 0.35s cubic-bezier(0.19, 1, 0.22, 1),
      transform 0.35s cubic-bezier(0.19, 1, 0.22, 1);

    &&:hover:not(:disabled) {
      filter: brightness(1.3);
    }
  `,
)

export const SStackRoot = styled.div(
  () => css`
    position: fixed;
    inset: auto 0 0 0;

    box-sizing: content-box;

    z-index: 1001;

    margin: 0 ${pxToRem(8)};
    margin-bottom: ${pxToRem(62)};
    padding: 0 ${pxToRem(12)} 0;

    min-height: ${pxToRem(200)};

    ${mq("sm")} {
      width: ${pxToRem(278)};
      height: ${pxToRem(345)};

      overflow: hidden;

      margin-bottom: ${pxToRem(42)};
      padding: 0 ${pxToRem(12)} ${pxToRem(12)};
    }
  `,
)

export const SStackEnter = styled.div<{
  readonly $depth: number
  readonly $closing: boolean
}>(
  ({ $depth, $closing }) => css`
    width: 100%;
    height: 100%;

    opacity: ${$closing ? 1 : 0};
    animation: ${$closing ? "gigaNewsClose" : "gigaNewsEnter"} 0.28s
      cubic-bezier(0.33, 1, 0.68, 1) both;
    animation-delay: ${Math.min($depth, $closing ? 1 : 1.5) * 0.06}s;

    @keyframes gigaNewsEnter {
      from {
        transform: translateY(50%);
        opacity: 0;
      }
      to {
        transform: translateY(0%);
        opacity: 1;
      }
    }

    @keyframes gigaNewsClose {
      from {
        transform: translateY(0%);
        opacity: 1;
      }
      to {
        transform: translateY(50%);
        opacity: 0;
      }
    }
  `,
)

const stackLayerTransform = (depth: number, yRem: number, scale: number) =>
  `translateX(-50%) translateY(${pxToRem(-yRem * depth)}) scale(${scale})`

export const SStackLayer = styled.div<{ readonly $depth: number }>(
  ({ $depth }) => css`
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 100%;
    z-index: ${100 - $depth};
    transform: ${stackLayerTransform($depth, 20, 1 - 0.07 * $depth)};
    transform-origin: bottom center;
    transition:
      transform 0.28s cubic-bezier(0.33, 1, 0.68, 1),
      opacity 0.22s ease;
    pointer-events: ${$depth === 0 ? "auto" : "none"};

    ${$depth === 0 &&
    css`
      &:hover {
        transform: translateX(-50%) scale(1.015);
      }
    `}

    ${mq("sm")} {
      transform: ${stackLayerTransform($depth, 30, 1 - 0.07 * $depth)};
    }
  `,
)

export const SGigaNewsContainer = styled(Box)<{ readonly $hidden?: boolean }>(
  ({ $hidden }) => hiddenStyles($hidden),
)

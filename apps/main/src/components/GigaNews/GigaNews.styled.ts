import { mq } from "@galacticcouncil/ui/theme"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

export const SStackRoot = styled.div(
  () => css`
    position: fixed;
    inset: auto 0 0 0;
    overflow: visible;
    z-index: 1001;

    margin: 0 1rem;
    margin-bottom: ${pxToRem(36)};

    min-height: ${pxToRem(200)};

    ${mq("sm")} {
      width: ${pxToRem(278)};
      height: ${pxToRem(345)};

      margin-bottom: ${pxToRem(42)};
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
    animation: ${$closing ? "gigaNewsClose" : "gigaNewsEnter"} 0.48s
      cubic-bezier(0.33, 1, 0.68, 1) both;
    animation-delay: ${Math.min($depth, 4) * 0.06}s;

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

export const SStackLayer = styled.div<{ readonly $depth: number }>(
  ({ $depth }) => css`
    position: absolute;
    inset: 0;
    width: 100%;
    z-index: ${100 - $depth};
    transform: translateY(${pxToRem(-20 * $depth)}) scale(${1 - 0.07 * $depth});
    transform-origin: bottom center;
    transition:
      transform 0.42s cubic-bezier(0.33, 1, 0.68, 1),
      opacity 0.32s ease;
    pointer-events: ${$depth === 0 ? "auto" : "none"};

    &:hover {
      transform: scale(1.015);
    }

    ${mq("sm")} {
      transform: translateY(${pxToRem(-30 * $depth)})
        scale(${1 - 0.07 * $depth});
    }
  `,
)

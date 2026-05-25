import { Button, Flex } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"

export const SLockedBalanceButton = styled(Button)(
  ({ theme }) => css`
    border: 1px solid;
    border-color: ${theme.buttons.secondary.low.borderRest};
    padding: ${theme.space.base};
    padding-block: ${theme.space.s};
    height: fit-content;
  `,
)

export const SClaimYieldPrompt = styled(Flex)(
  ({ theme }) => css`
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.base};

    padding: ${theme.space.base};

    border: 1px solid ${theme.buttons.secondary.low.borderRest};
    border-radius: ${theme.radii.l};
    background: ${theme.surfaces.themeBasePalette.surfaceHigh};
  `,
)

export const SRewardMultiplierCard = styled(Flex)(
  ({ theme }) => css`
    --electric-start-color: ${theme.text.low};
    --electric-end-color: ${theme.buttons.primary.medium.rest};
    --electric-border-color: var(--electric-end-color);
    --electric-light-color: var(--electric-start-color);
    --electric-muted-border-color: ${theme.buttons.secondary.low.borderRest};

    position: relative;
    isolation: isolate;
    overflow: visible;
    animation: rewardMultiplierShake var(--electric-shake-duration) linear
      infinite;

    border-radius: ${theme.radii.l};
    background: ${theme.surfaces.themeBasePalette.surfaceHigh};

    .eb-svg {
      position: absolute;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .eb-content {
      position: relative;
      z-index: 2;
      width: 100%;
      border-radius: inherit;
    }

    .eb-layers {
      position: absolute;
      inset: 0;
      z-index: 0;
      border-radius: inherit;
      pointer-events: none;
    }

    .eb-border-outer {
      position: absolute;
      inset: 0;
      border: 1px solid var(--electric-muted-border-color);
      border-radius: inherit;
    }

    .eb-main-border {
      width: 100%;
      height: 100%;
      border: 1px solid var(--electric-border-color);
      border-radius: inherit;
      filter: url("#vote-reward-turbulent-displace");
    }

    .eb-glow-1,
    .eb-glow-2,
    .eb-overlay-1,
    .eb-overlay-2,
    .eb-background-glow {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-sizing: border-box;
      pointer-events: none;
    }

    .eb-glow-1 {
      border: 1px solid var(--electric-muted-border-color);
      filter: blur(1px);
    }

    .eb-glow-2 {
      border: 1px solid var(--electric-border-color);
      opacity: 0.11;
      filter: blur(4px);
    }

    .eb-overlay-1,
    .eb-overlay-2 {
      mix-blend-mode: overlay;
      transform: scaleX(1.02) scaleY(1.05);
      filter: blur(10px);
      background: linear-gradient(
        -30deg,
        var(--electric-border-color),
        transparent 30%,
        transparent 70%,
        var(--electric-border-color)
      );
    }

    .eb-overlay-1 {
      opacity: calc(0.0375 + var(--electric-progress-number) * 0.1125);
    }

    .eb-overlay-2 {
      opacity: calc(0.02 + var(--electric-progress-number) * 0.06);
    }

    .eb-background-glow {
      z-index: -1;
      transform: scaleX(1.015) scaleY(1.07);
      filter: blur(20px);
      opacity: 0.045;
      background: linear-gradient(
        -30deg,
        var(--electric-border-color),
        transparent 48%,
        var(--electric-border-color)
      );
    }

    .reward-rocket {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--electric-border-color);
    }

    .reward-rocket svg {
      overflow: visible;
    }

    .reward-rocket svg > path:first-of-type {
      transform-box: fill-box;
      transform-origin: 78% 22%;
      opacity: calc(0.45 + var(--electric-progress-number) * 0.4);
      filter: drop-shadow(0 0 3px var(--electric-border-color));
      animation: rewardRocketEngine var(--electric-shake-duration) ease-in-out
        infinite;
    }

    @supports (color: color-mix(in srgb, red, blue)) {
      --electric-border-color: color-mix(
        in srgb,
        var(--electric-start-color) calc(100% - var(--electric-progress)),
        var(--electric-end-color) var(--electric-progress)
      );
      --electric-light-color: color-mix(
        in srgb,
        var(--electric-start-color) 72%,
        var(--electric-border-color)
      );
      --electric-muted-border-color: color-mix(
        in srgb,
        var(--electric-border-color) 50%,
        transparent
      );

      .eb-glow-1 {
        border-color: color-mix(
          in srgb,
          var(--electric-border-color) 60%,
          transparent
        );
      }
    }

    @keyframes rewardMultiplierShake {
      0%,
      100% {
        transform: translate3d(0, 0, 0);
      }

      25% {
        transform: translate3d(var(--electric-shake-distance), 0, 0);
      }

      50% {
        transform: translate3d(
          0,
          calc(var(--electric-shake-distance) * -0.6),
          0
        );
      }

      75% {
        transform: translate3d(calc(var(--electric-shake-distance) * -1), 0, 0);
      }
    }

    @keyframes rewardRocketEngine {
      0%,
      100% {
        transform: translate3d(0, 0, 0) rotate(-2deg) scale(0.92, 0.82);
      }

      45% {
        transform: translate3d(-0.08rem, 0.1rem, 0) rotate(-12deg)
          scale(1.08, 1.18);
      }

      70% {
        transform: translate3d(0.04rem, -0.03rem, 0) rotate(4deg)
          scale(0.96, 0.92);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      &,
      .reward-rocket svg > path:first-of-type {
        animation: none;
      }
    }
  `,
)

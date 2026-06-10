# Voting Reward Multiplier Effect

This documents the reward multiplier card used under the voting power multiplier slider in the vote modal.

The effect is dependency-free: it uses Hydration UI theme tokens, CSS animations, and an inline SVG turbulence/displacement filter. The current tuning keeps the high-conviction animation fast, but makes the displaced border smoother and more water-like.

## Current Behavior

- `0.1x`: grey, slow, soft displacement, almost no card shake.
- Higher multipliers: color interpolates toward `controls.solid.accent`, which keeps the effect aligned with both light and dark modes.
- `6x`: fastest border movement, smoother wave-like displacement, subtle card shake, and animated rocket engine.
- The side/end glows are intentionally restrained so the card does not bloom too aggressively.
- The displaced border is nudged slightly upward at high intensity so it wraps the actual card border more evenly.
- `prefers-reduced-motion` disables the card shake and rocket engine animation.

## Current Parameters

- Progress: `multiplier / 6`, clamped from `0` to `1`.
- Motion intensity: `progress ** 1.6`, so the lower multipliers stay calm and the effect ramps more noticeably near 6x.
- Border animation duration: `Math.max(1.45, 6 - motionIntensity * 4.15)`.
- Card shake duration: `Math.max(0.32, 1.2 - motionIntensity * 0.78)`.
- Card shake distance: `motionIntensity * 0.85px`.
- Displaced border Y offset: `motionIntensity * -2.5`.
- Turbulence frequency: `0.015`.
- Turbulence octaves: `6`.
- Displacement scale: `2 + motionIntensity * 12`.
- Vertical noise scroll: `700 -> 0` and `0 -> -700`.
- Horizontal noise scroll: `490 -> 0` and `0 -> -490`.

At 6x, `motionIntensity` is `1`, so the border duration is `1.85s`, shake duration is `0.42s`, shake distance is `0.85px`, Y offset is `-2.5`, and displacement scale is `14`.

## Theme Tokens

Use existing tokens only:

- `theme.text.low`: low-multiplier grey start color.
- `theme.controls.solid.accent`: max-multiplier accent color for the animated border, glow layers, rocket, and accent slider.
- `theme.controls.solid.onAccent`: three-line slider handle icon color on the accent thumb.
- `theme.buttons.secondary.low.borderRest`: muted border fallback.
- `theme.surfaces.themeBasePalette.surfaceHigh`: card background.
- `theme.radii.l`: card radius.
- `theme.space.l`: card padding via `px="l"` and `py="l"`.
- `getToken("text.high")`: label text color.

No new color tokens or outside dependencies are required.

## Component

```tsx
const MULTIPLIER_LABELS = ["0.1x", "1x", "2x", "3x", "4x", "5x", "6x"]

const getMultiplierLabel = (multiplier: number) => `${multiplier || 0.1}x`
const getMultiplierProgress = (multiplier: number) =>
  Math.min(Math.max(multiplier / 6, 0), 1)

const RewardMultiplierCard = ({ multiplier }: { multiplier: number }) => {
  const { t } = useTranslation("staking")
  const progress = getMultiplierProgress(multiplier)
  const motionIntensity = progress ** 1.6
  const electricDurationSeconds = Math.max(1.45, 6 - motionIntensity * 4.15)
  const displacementOffsetY = motionIntensity * -2.5
  const multiplierMotionStyle = {
    "--electric-progress": `${Math.round(progress * 100)}%`,
    "--electric-progress-number": progress,
    "--electric-duration": `${electricDurationSeconds}s`,
    "--electric-shake-duration": `${Math.max(
      0.32,
      1.2 - motionIntensity * 0.78,
    )}s`,
    "--electric-shake-distance": `${motionIntensity * 0.85}px`,
  } as CSSProperties

  return (
    <SRewardMultiplierCard
      align="center"
      justify="space-between"
      px="l"
      py="l"
      mt="m"
      style={multiplierMotionStyle}
    >
      <svg className="eb-svg" aria-hidden focusable="false">
        <defs>
          <filter
            id="vote-reward-turbulent-displace"
            colorInterpolationFilters="sRGB"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise1"
              seed="1"
            />
            <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
              <animate
                attributeName="dy"
                values="700; 0"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise2"
              seed="1"
            />
            <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
              <animate
                attributeName="dy"
                values="0; -700"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise3"
              seed="2"
            />
            <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
              <animate
                attributeName="dx"
                values="490; 0"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feTurbulence
              type="turbulence"
              baseFrequency="0.015"
              numOctaves="6"
              result="noise4"
              seed="2"
            />
            <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
              <animate
                attributeName="dx"
                values="0; -490"
                dur={`${electricDurationSeconds}s`}
                repeatCount="indefinite"
                calcMode="linear"
              />
            </feOffset>

            <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
            <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
            <feBlend
              in="part1"
              in2="part2"
              mode="color-dodge"
              result="combinedNoise"
            />
            <feOffset
              in="SourceGraphic"
              dx="0"
              dy={displacementOffsetY}
              result="alignedBorder"
            />
            <feDisplacementMap
              in="alignedBorder"
              in2="combinedNoise"
              scale={2 + motionIntensity * 12}
              xChannelSelector="R"
              yChannelSelector="B"
            />
          </filter>
        </defs>
      </svg>

      <div className="eb-layers" aria-hidden>
        <div className="eb-border-outer">
          <div className="eb-main-border" />
        </div>
        <div className="eb-glow-1" />
        <div className="eb-glow-2" />
        <div className="eb-overlay-1" />
        <div className="eb-overlay-2" />
        <div className="eb-background-glow" />
      </div>

      <Flex className="eb-content" align="center" justify="space-between">
        <Text fs="p3" fw={500} color={getToken("text.high")}>
          {t("referenda.vote.modal.rewardMultiplier")}
        </Text>
        <Flex align="center" gap="s">
          <Text
            font="primary"
            fs="h6"
            fw={500}
            lh={1}
            color="var(--electric-border-color)"
          >
            {getMultiplierLabel(multiplier)}
          </Text>
          <span className="reward-rocket" aria-hidden>
            <Icon component={Rocket} size="l" />
          </span>
        </Flex>
      </Flex>
    </SRewardMultiplierCard>
  )
}
```

## Styled Component

```ts
export const SRewardMultiplierCard = styled(Flex)(
  ({ theme }) => css`
    --electric-start-color: ${theme.text.low};
    --electric-end-color: ${theme.controls.solid.accent};
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
```

## Rocket Icon Animation

- The card imports the existing `Rocket` icon from `@galacticcouncil/ui/assets/icons`.
- The icon color follows `var(--electric-border-color)`, so it transitions from grey to `controls.solid.accent` alongside the border.
- Only the first SVG path is animated, which targets the flame/engine part of the icon.
- The path opacity is `calc(0.45 + var(--electric-progress-number) * 0.4)`, so it becomes more visible at higher conviction.
- The path uses `drop-shadow(0 0 3px var(--electric-border-color))`.
- The `rewardRocketEngine` keyframes squash, stretch, rotate, and nudge the engine path using the same duration as the card shake.

## Slider Styling

- The vote multiplier slider opts into `variant="accent"`.
- The accent slider range and thumb use `theme.controls.solid.accent`.
- The handle's three-line `Union` icon uses `getToken("controls.solid.onAccent")`.
- Other sliders keep the default `theme.text.tint.secondary` range/thumb color and `controls.outline.active` handle icon color.
- The handle shadow matches the softer slider token values:

```css
box-shadow:
  0 0 17.2px 0 rgba(0, 0, 0, 0.03),
  0 4px 2.8px 0 rgba(0, 0, 0, 0.1);
```

- Hover grows the handle slightly with a soft bounce:

```css
transition:
  transform 240ms cubic-bezier(0.34, 1.56, 0.64, 1),
  box-shadow ${theme.transitions.transform};

&:hover {
  transform: scale(1.06);
}
```

## Notes

- Keep `electricDurationSeconds` separate from displacement strength. This lets 6x stay fast while the border can be tuned independently.
- To make the wave calmer without slowing it down, reduce `baseFrequency`, `numOctaves`, or `scale`.
- To make the card feel calmer overall, reduce `--electric-shake-distance` or increase `--electric-shake-duration`.
- The SVG filter remains inline so each rendered card owns its own animation timing and intensity.

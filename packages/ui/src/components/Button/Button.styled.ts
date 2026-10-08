import { css, Theme } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { pressScale, pressScaleTransition } from "@/styles/press"
import { createStyles, createVariants, pxToRem } from "@/utils"

import { LOADING_ENTER_MS, LOADING_EXIT_MS } from "./useLoadingState"

const SOFT_VARIANTS = [
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const

type SoftVariant = (typeof SOFT_VARIANTS)[number]

const softVariants = <T>(style: (variant: SoftVariant) => T) =>
  Object.fromEntries(
    SOFT_VARIANTS.map((variant) => [variant, style(variant)]),
  ) as Record<SoftVariant, T>

export type ButtonVariant =
  | SoftVariant
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "emphasis"
  | "accent"
  | "success"
  | "warning"
  | "muted"
  | "transparent"
  | "ghost"

export type ButtonSize = "micro" | "small" | "medium" | "large"

export type SButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  outline?: boolean
  blur?: boolean
  glow?: boolean
  uppercase?: boolean
}

export type LoadingMode = "inline" | "replace"

const DISABLED_OPACITY = 0.2

const ENABLED = ':not(:disabled):not([aria-disabled="true"])'

const ICON = ":is(svg, span:has(> svg:only-child))"

const iconStyles = css`
  & > ${ICON} {
    flex: none;
    max-width: none;
    width: var(--button-icon, 1.15em);
    width: round(var(--button-icon, 1.15em), 2px);
    height: var(--button-icon, 1.15em);
    height: round(var(--button-icon, 1.15em), 2px);
  }

  & > ${ICON} * {
    vector-effect: non-scaling-stroke;
  }

  & > [data-icon="start"] {
    margin-inline-start: -0.125em;
    margin-inline-start: round(-0.125em, 1px);
  }

  & > [data-icon="end"] {
    margin-inline-end: var(--button-icon-end, -0.125em);
    margin-inline-end: round(var(--button-icon-end, -0.125em), 1px);
  }
`

const iconGap = css`
  column-gap: 0.4em;
  column-gap: round(0.4em, 1px);
`

const defaultStyles = createStyles(
  (theme) => css`
    position: relative;
    display: grid;
    grid-auto-flow: column;
    ${iconGap}
    align-items: center;
    place-content: center;

    height: var(--button-height);

    text-decoration: none;
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    white-space: nowrap;

    border-radius: ${theme.radii.full};

    cursor: pointer;

    /* registered as a color, so the fill can transition through it */
    @property --button-bg {
      syntax: "<color>";
      inherits: false;
      initial-value: transparent;
    }

    transition:
      color 0.2s,
      border-color 0.2s,
      --button-bg 0.2s,
      ${theme.transitions.opacity},
      ${pressScaleTransition};

    ${pressScale};

    &:is(:link) {
      text-decoration: none;
    }

    /* the global reset unsets the browser's ring, so keyboard focus is drawn here */
    &:focus-visible {
      outline: 2px solid ${theme.text.high};
      outline-offset: 2px;
    }

    ${iconStyles}
  `,
)

/* hover only where a pointer can hover, so a tap leaves no stuck fill; a press shows it everywhere */
const hoverStyles = (bg: string, color?: string) => css`
  @media (hover: hover) and (pointer: fine) {
    &:hover${ENABLED} {
      --button-bg: ${bg};
      color: ${color};
    }
  }

  &:active${ENABLED} {
    --button-bg: ${bg};
    color: ${color};
  }
`

const variantStyles = (
  color: string,
  bg: string,
  bgHover: string,
  colorHover?: string,
  /* the focus ring takes the fill, or the text color when the fill is transparent */
  ring = bg === "transparent" ? color : bg,
) => css`
  --button-bg: ${bg};
  background-color: var(--button-bg);
  color: ${color};
  ${hoverStyles(bgHover, colorHover)}

  &:focus-visible {
    outline-color: ${ring};
  }
`

const outlineVariantStyles = (
  color: string,
  border: "none" | (string & NonNullable<unknown>),
  bg: string,
  bgHover: string,
  /* the focus ring takes the text color, unless a variant passes a dimmer one */
  ring = color,
) => css`
  --button-bg: ${bg};
  background-color: var(--button-bg);
  color: ${color};
  ${hoverStyles(bgHover)}

  &:focus-visible {
    outline-color: ${ring};
  }

  ${border === "none"
    ? css`
        box-shadow: none;
      `
    : css`
        box-shadow: inset 0 0 0 1px ${border};
      `}
`

const tint = (color: string, percent: number) =>
  `color-mix(in srgb, ${color} ${percent}%, transparent)`

/* neutral variants get a dim ring, because their near-white text color glares as a ring in dark mode */
const quietRing = (theme: Theme) => tint(theme.text.low, 60)

const tintedOutlineStyles = (color: string) =>
  outlineVariantStyles(color, color, tint(color, 10), tint(color, 30))

/* the glow is the variant's main color at a fixed strength, so every variant glows alike */
const glowVariantStyles = (border: string, color = border) => css`
  box-shadow:
    inset 0 0 0 1px ${border},
    0 0 10px 2px color-mix(in oklch, ${color} 40%, transparent);
`

const disabledStyles = css`
  &:disabled,
  &[aria-disabled="true"] {
    cursor: not-allowed;

    opacity: ${DISABLED_OPACITY};
  }
`

const uppercaseStyles = css`
  text-transform: uppercase;
`

const blurStyles = css`
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
`

/* lightens a solid fill the way the primary and secondary hover tokens do */
const hoverFill = (color: string) => `color-mix(in srgb, ${color} 75%, white)`

const variants = createVariants<ButtonVariant>((theme) => ({
  primary: variantStyles(
    theme.buttons.primary.high.onButton,
    theme.buttons.primary.high.rest,
    theme.buttons.primary.high.hover,
  ),
  secondary: variantStyles(
    theme.buttons.primary.medium.onButton,
    theme.buttons.primary.medium.rest,
    theme.buttons.primary.medium.hover,
  ),
  tertiary: variantStyles(
    theme.buttons.primary.low.onButton,
    theme.buttons.primary.low.rest,
    theme.buttons.primary.low.hover,
  ),
  danger: variantStyles(
    theme.buttons.primary.high.onButton,
    theme.buttons.secondary.danger.onRest,
    hoverFill(theme.buttons.secondary.danger.onRest),
  ),
  emphasis: variantStyles(
    theme.buttons.primary.high.onButton,
    theme.buttons.secondary.emphasis.onRest,
    hoverFill(theme.buttons.secondary.emphasis.onRest),
  ),
  accent: variantStyles(
    theme.buttons.primary.high.onButton,
    theme.buttons.secondary.accent.onRest,
    hoverFill(theme.buttons.secondary.accent.onRest),
  ),
  success: variantStyles(
    theme.accents.success.onEmphasis,
    theme.accents.success.emphasis,
    hoverFill(theme.accents.success.emphasis),
  ),
  warning: variantStyles(
    theme.accents.alertAlt.onPrimary,
    theme.accents.alertAlt.primary,
    hoverFill(theme.accents.alertAlt.primary),
  ),
  muted: variantStyles(
    theme.buttons.secondary.low.onRest,
    theme.buttons.outlineDark.rest,
    theme.colors.darkBlue.alpha[200],
    undefined,
    quietRing(theme),
  ),
  transparent: variantStyles(
    theme.text.high,
    "transparent",
    theme.colors.darkBlue.alpha[200],
    undefined,
    quietRing(theme),
  ),
  ghost: variantStyles(
    theme.text.medium,
    "transparent",
    theme.buttons.secondary.low.hover,
    theme.text.high,
    quietRing(theme),
  ),
  ...softVariants((variant) => {
    const { foreground, background } = theme.tags.soft[variant]

    return variantStyles(
      foreground,
      background,
      `color-mix(in oklch, ${foreground} 25%, transparent)`,
      undefined,
      foreground,
    )
  }),
}))

const outlineVariants = createVariants<ButtonVariant>((theme) => ({
  primary: tintedOutlineStyles(theme.buttons.primary.high.rest),
  secondary: tintedOutlineStyles(theme.buttons.primary.medium.rest),
  tertiary: outlineVariantStyles(
    theme.text.medium,
    theme.buttons.secondary.low.borderRest,
    theme.buttons.secondary.low.rest,
    theme.buttons.secondary.low.hover,
    quietRing(theme),
  ),
  danger: tintedOutlineStyles(theme.buttons.secondary.danger.onRest),
  emphasis: tintedOutlineStyles(theme.buttons.secondary.emphasis.onRest),
  accent: tintedOutlineStyles(theme.buttons.secondary.accent.onRest),
  success: tintedOutlineStyles(theme.accents.success.emphasis),
  warning: tintedOutlineStyles(theme.accents.alertAlt.primary),
  transparent: outlineVariantStyles(
    theme.text.high,
    theme.colors.darkBlue.alpha[200],
    "transparent",
    theme.colors.darkBlue.alpha[200],
    quietRing(theme),
  ),
  muted: outlineVariantStyles(
    theme.text.medium,
    theme.buttons.secondary.low.borderRest,
    theme.buttons.outlineDark.rest,
    theme.buttons.secondary.low.hover,
    quietRing(theme),
  ),
  ghost: outlineVariantStyles(
    theme.text.medium,
    theme.buttons.secondary.low.borderRest,
    "transparent",
    theme.buttons.secondary.low.hover,
    quietRing(theme),
  ),
  ...softVariants((variant) =>
    tintedOutlineStyles(theme.tags.soft[variant].foreground),
  ),
}))

const glowVariants = createVariants<ButtonVariant>((theme) => ({
  primary: glowVariantStyles(theme.buttons.primary.high.rest),
  secondary: glowVariantStyles(theme.buttons.primary.medium.rest),
  tertiary: glowVariantStyles(
    theme.buttons.secondary.low.borderRest,
    theme.text.medium,
  ),
  danger: glowVariantStyles(theme.buttons.secondary.danger.onRest),
  emphasis: glowVariantStyles(theme.buttons.secondary.emphasis.onRest),
  accent: glowVariantStyles(theme.buttons.secondary.accent.onRest),
  success: glowVariantStyles(theme.accents.success.emphasis),
  warning: glowVariantStyles(theme.accents.alertAlt.primary),
  muted: glowVariantStyles(
    theme.buttons.secondary.low.borderRest,
    theme.text.medium,
  ),
  transparent: css``,
  ghost: css``,
  ...softVariants((variant) =>
    glowVariantStyles(theme.tags.soft[variant].foreground),
  ),
}))

const sizes = createVariants<ButtonSize>((theme) => ({
  micro: css`
    --button-height: ${pxToRem(17)};
    --button-icon: 1em;
    --button-icon-only: 1em;

    height: auto;
    min-height: var(--button-height);
    line-height: 1;
    font-size: ${theme.fontSizes.p6};
    padding: ${theme.space.xs} ${theme.space.base};

    column-gap: 0.2em;
    column-gap: round(0.2em, 1px);

    & > ${ICON} *,
    & > * > [data-loading-content] > ${ICON} * {
      stroke-width: 1.5px;
    }
  `,
  small: css`
    --button-height: 1.875rem;
    --button-icon-only: ${theme.sizes.m};

    line-height: 1.2;
    font-size: ${theme.fontSizes.p6};
    padding: ${theme.space.base} ${theme.buttons.paddings.primary};

    & > ${ICON} *,
    & > * > [data-loading-content] > ${ICON} * {
      stroke-width: 1.5px;
    }
  `,
  medium: css`
    --button-height: 2.5rem;
    --button-icon-only: ${theme.sizes.l};

    line-height: 1.2;
    font-size: ${theme.fontSizes.p5};
    padding: ${theme.space.base} ${theme.buttons.paddings.primary};
  `,
  large: css`
    --button-height: 3.125rem;
    --button-icon-only: ${theme.sizes.xl};

    line-height: 1;
    font-size: ${theme.fontSizes.p3};
    padding: ${theme.buttons.paddings.primary} ${theme.space.xl};
  `,
}))

/* :where keeps the specificity of a plain class, so sx and styled() can still override it */
const iconOnlyStyles = css`
  &:where([data-icon-only]) {
    --button-icon: var(--button-icon-only);

    width: var(--button-height);
    height: var(--button-height);
    padding: 0;
  }
`

export const SButton = styled(Box, {
  shouldForwardProp: (prop) =>
    !["variant", "size", "outline", "blur", "glow", "uppercase"].includes(prop),
})<SButtonProps>(
  defaultStyles,
  ({
    variant = "primary",
    size = "small",
    outline = false,
    blur = false,
    glow = false,
    uppercase = false,
  }) => [
    sizes(size),
    outline ? outlineVariants(variant) : variants(variant),
    blur ? blurStyles : undefined,
    glow ? glowVariants(variant) : undefined,
    uppercase ? uppercaseStyles : undefined,
    iconOnlyStyles,
  ],
  disabledStyles,
)

export const SDefaultButton = styled(Box, {
  shouldForwardProp: (prop) => !["variant", "size", "outline"].includes(prop),
})<SButtonProps>(
  defaultStyles,
  ({ size = "small" }) => [sizes(size)],
  disabledStyles,
)

export const SButtonTransparent = styled.button`
  background: transparent;

  margin: 0;
  padding: 0;
  border: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &[disabled] {
    cursor: unset;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }
`

const loadingLabelStyles = createStyles(
  (theme) => css`
    & > [data-loading-spinner],
    & > [data-loading-content] {
      display: inline-grid;
      grid-auto-flow: column;
      column-gap: ${theme.space.base};
      place-items: center;
    }

    & > [data-loading-content] {
      ${iconGap}
      ${iconStyles}
    }

    & > [data-loading-spinner] svg {
      width: 1em;
      height: 1em;
    }
  `,
)

const loadingLabelVariants = createVariants<LoadingMode>((theme) => ({
  inline: css`
    --loading-spinner-space: calc(1em + ${theme.space.s});

    position: relative;
    display: inline-grid;

    transition:
      transform ${LOADING_EXIT_MS}ms ${theme.easings.inQuad},
      margin ${LOADING_EXIT_MS}ms ${theme.easings.inQuad};

    & > [data-loading-spinner] {
      position: absolute;
      top: 50%;
      left: 0;

      width: 1em;
      height: 1em;

      opacity: 0;
      transform: translate(
        calc(-100% - ${theme.space.base} + ${theme.space.s}),
        -50%
      );

      transition:
        opacity ${LOADING_EXIT_MS}ms ${theme.easings.inQuad},
        transform ${LOADING_EXIT_MS}ms ${theme.easings.inQuad};
    }

    [aria-busy="true"] > & {
      margin-inline: calc(var(--loading-spinner-space) / 2);
      transform: translateX(calc(var(--loading-spinner-space) / 2));

      transition:
        transform ${LOADING_ENTER_MS}ms ${theme.easings.outExpo},
        margin ${LOADING_ENTER_MS}ms ${theme.easings.outExpo};
    }

    [aria-busy="true"] > & > [data-loading-spinner] {
      opacity: 1;
      transform: translate(calc(-100% - 0.5em), -50%);

      transition:
        opacity ${LOADING_ENTER_MS}ms ${theme.easings.outExpo},
        transform ${LOADING_ENTER_MS}ms ${theme.easings.outExpo};
    }
  `,
  replace: css`
    display: grid;
    overflow: clip;

    line-height: 1.4;

    & > * {
      grid-area: 1 / 1;
      align-self: stretch;
      justify-self: center;

      transition:
        transform ${LOADING_EXIT_MS}ms ${theme.easings.inQuad},
        opacity ${LOADING_EXIT_MS}ms ${theme.easings.inQuad};
    }

    [aria-busy="true"] > & > * {
      transition:
        transform ${LOADING_ENTER_MS}ms ${theme.easings.outExpo},
        opacity ${LOADING_ENTER_MS}ms ${theme.easings.outExpo};
    }

    & > [data-loading-content] {
      opacity: 1;
    }

    & > [data-loading-spinner] {
      opacity: 0;
    }

    [aria-busy="true"] > & > [data-loading-content] {
      opacity: 0;
    }

    [aria-busy="true"] > & > [data-loading-spinner] {
      opacity: 1;
    }

    & > [data-loading-spinner] {
      transform: translateY(100%);
    }

    [aria-busy="true"] > & > [data-loading-content] {
      transform: translateY(-100%);
    }

    [aria-busy="true"] > & > [data-loading-spinner] {
      transform: translateY(0);
    }
  `,
}))

export const SLoadingLabel = styled.span<{ loadingMode: LoadingMode }>(
  loadingLabelStyles,
  ({ loadingMode }) => loadingLabelVariants(loadingMode),
)

export const SLoadingButton = styled(SButton, {
  shouldForwardProp: (prop) => !["loadingFade", "disabledFade"].includes(prop),
})<{
  loadingFade?: boolean
  disabledFade?: boolean
}>(({ loadingFade = false, disabledFade = false }) => [
  css`
    &[aria-busy="true"] {
      pointer-events: none;
    }
  `,
  disabledFade
    ? undefined
    : css`
        &:disabled,
        &[aria-disabled="true"] {
          opacity: 1;
        }
      `,
  loadingFade
    ? css`
        &[aria-busy="true"] {
          opacity: ${DISABLED_OPACITY};
        }
      `
    : css`
        &[aria-busy="true"]:disabled,
        &[aria-busy="true"][aria-disabled="true"] {
          opacity: 1;
        }
      `,
])

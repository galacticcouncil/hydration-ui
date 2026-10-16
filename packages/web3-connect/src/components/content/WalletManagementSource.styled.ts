import { Theme } from "@emotion/react"
import { Box, Image, Text } from "@galacticcouncil/ui/components"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"

const roundMark = (theme: Theme, size: string) => css`
  width: ${size};
  height: ${size};
  border-radius: ${theme.radii.full};
  flex-shrink: 0;
  object-fit: contain;
`

export const SConnectedDot = styled(Box)(
  ({ theme }) => css`
    position: absolute;
    right: -${theme.space.xs};
    bottom: -${theme.space.xs};
    width: ${theme.sizes["2xs"]};
    height: ${theme.sizes["2xs"]};
    background: ${theme.accents.success.emphasis};
    border: 2px solid ${theme.surfaces.themeBasePalette.background};
    border-radius: ${theme.radii.full};
    box-sizing: border-box;
    pointer-events: none;
    transition: ${theme.transitions.colors};
  `,
)

/** Shared look of the modal's clickable rows: wallet sources, accounts, external wallet recents/contacts. */
export const optionTile = (theme: Theme) => css`
  border: 1px solid transparent;
  border-radius: ${theme.radii.m};
  background: ${theme.surfaces.containers.dim.dimOnBg};
  color: ${theme.text.high};

  cursor: pointer;
  transition: ${theme.transitions.colors};

  &:hover {
    background-color: ${theme.controls.dim.active};
    border-color: ${theme.buttons.secondary.outline.outline};
  }

  &[data-active="true"] {
    background: ${theme.buttons.secondary.accent.rest};
    border-color: ${theme.buttons.secondary.accent.outline};

    &:hover {
      background: ${theme.controls.dim.active};
    }
  }
`

export const SSourceButton = styled.button(
  ({ theme }) => css`
    ${optionTile(theme)}

    width: 100%;
    min-height: ${pxToRem(40)};

    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.s};

    padding: ${theme.space.base};
    padding-right: ${theme.space.s};

    &[data-variant="firstConnectionPlain"] {
      width: auto;
      min-height: ${pxToRem(36)};
      align-self: flex-start;
      justify-content: flex-start;
      padding: ${theme.space.s} ${theme.space.base};
      background: transparent;

      &:hover {
        background: ${theme.buttons.secondary.accent.restSubtle};
        border-color: transparent;
      }
    }
  `,
)

export type SourceIconColor = keyof Theme["tags"]["soft"] | "neutral" | "dark"

export const SSourceIcon = styled(Box, {
  shouldForwardProp: (prop) => prop !== "iconColor",
})<{ iconColor?: SourceIconColor }>(
  ({ theme, iconColor }) => css`
    width: ${theme.sizes.xl};
    height: ${theme.sizes.xl};
    border-radius: ${theme.radii.full};

    background: ${iconColor === "neutral"
      ? theme.controls.dim.accent
      : iconColor === "dark"
        ? theme.colors.greys[900]
        : iconColor
          ? theme.tags.soft[iconColor].background
          : theme.buttons.secondary.outline.fill};
    color: ${iconColor === "dark"
      ? theme.colors.greys[100]
      : iconColor && iconColor !== "neutral"
        ? theme.tags.soft[iconColor].foreground
        : theme.text.high};

    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
)

export const SSourceLogo = styled(Image)(
  ({ theme }) => css`
    width: ${theme.sizes.xl};
    height: ${theme.sizes.xl};
    flex-shrink: 0;
    object-fit: contain;
  `,
)

export const SStackedSourceLogo = styled(Image)(
  ({ theme }) => css`
    ${roundMark(theme, theme.sizes.s)}

    & + & {
      margin-left: -${theme.space.s};
    }
  `,
)

export const SSourceChainBadge = styled(Box)(
  ({ theme }) => css`
    width: ${theme.sizes["m"]};
    height: ${theme.sizes["m"]};
    border-radius: ${theme.radii.full};

    background: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.surfaces.containers.high.primary};

    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    & + & {
      margin-left: ${pxToRem(-5)};
    }
  `,
)

export const SChainBadgeImage = styled(Image)(
  ({ theme }) => css`
    ${roundMark(theme, theme.sizes.xs)}
  `,
)

export const SSourceAction = styled(Box)(
  ({ theme }) => css`
    width: ${theme.sizes.l};
    height: ${theme.sizes.l};
    border-radius: ${theme.radii.base};

    color: ${theme.text.medium};
    cursor: pointer;

    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: ${theme.controls.dim.hover};
      color: ${theme.text.high};
    }
  `,
)

export const SSourceCategoryLabel = styled(Text)(
  ({ theme }) => css`
    position: sticky;
    top: 0;
    z-index: 1;

    background: ${theme.surfaces.themeBasePalette.surfaceHigh};
    padding-bottom: ${theme.space.s};
  `,
)

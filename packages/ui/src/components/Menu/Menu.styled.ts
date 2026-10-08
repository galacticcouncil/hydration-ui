import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { Icon } from "@/components/Icon"
import { createVariants, css } from "@/utils"

export type MenuItemVariant = "default" | "filterLink"

const menuItemVariants = createVariants<MenuItemVariant>((theme) => ({
  default: css`
    & ${MenuItemIcon} {
      color: ${theme.icons.onContainer};
    }

    & ${MenuItemLabel} {
      color: ${theme.text.high};
    }
  `,
  filterLink: css`
    & ${MenuItemIcon} {
      color: ${theme.icons.onSurfaceHover};
    }

    & ${MenuItemLabel} {
      color: ${theme.text.medium};
      line-height: 1.4;
    }
  `,
}))

export const MenuItem = styled(Box)<{ variant?: MenuItemVariant }>(
  ({ theme, variant = "default" }) => [
    css`
      display: grid;
      grid-template-columns: auto 1fr auto;
      grid-template-rows: 1fr 1fr;
      column-gap: var(--menu-item-gap, ${theme.space.base});
      align-items: center;
      justify-items: start;

      padding: var(
        --menu-item-padding,
        ${theme.space.m} ${theme.containers.paddings.tertiary}
      );

      text-decoration: none;

      /* a menu shows focus with the highlight fill; the ring stays transparent so forced-colors mode can paint it */
      &:focus {
        outline: 2px solid transparent;
        outline-offset: -2px;
      }
    `,
    menuItemVariants(variant),
  ],
)

export const MenuItemIcon = styled(Icon)(
  ({ theme }) => css`
    grid-row: 1 / -1;
    width: var(--menu-item-icon-size, ${theme.sizes.l});
    height: var(--menu-item-icon-size, ${theme.sizes.l});
    padding: ${theme.space.xs};
    flex-shrink: 0;
  `,
)

export const MenuItemLabel = styled.span(
  ({ theme }) => css`
    grid-row: 1;
    grid-column: 2;

    &:not(:has(+ ${MenuItemDescription})) {
      grid-row: 1 / -1;
    }

    display: flex;
    align-items: center;
    gap: calc(${theme.space.s} + 0.125em);

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: var(--menu-item-font-weight, 600);
    font-size: var(--menu-item-font-size, ${theme.fontSizes.p3});
    line-height: var(--menu-item-line-height, ${theme.lineHeights.m});
    letter-spacing: 0%;
    text-align: center;
  `,
)

export const MenuItemDescription = styled.span(
  ({ theme }) => css`
    grid-row-start: 2;
    grid-column: 2;

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 400;
    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.s};
    letter-spacing: 0%;

    color: ${theme.text.low};
  `,
)

export const MenuItemAction = styled.div`
  grid-row: 1 / -1;
  grid-column: 3;
`

export const MenuSelectionItem = styled(MenuItem)<{
  variant?: MenuItemVariant
  disabled?: boolean
}>(({ theme, variant = "default" }) => [
  css`
    border-radius: ${theme.containers.cornerRadius.internalPrimary};
    cursor: pointer;

    @media (hover: hover) and (pointer: fine) {
      &:hover:not([disabled]) {
        background-color: ${theme.buttons.secondary.low.primaryHover};
      }
    }

    &:active:not([disabled]),
    &[data-highlighted] {
      background-color: ${theme.buttons.secondary.low.primaryHover};
    }

    /* outside a menu nothing sets data-highlighted, so keyboard focus gets a ring */
    &:focus-visible:not([data-highlighted]) {
      outline-color: ${theme.text.high};
    }

    /* a picked radio or checkbox item takes the text color of the outlined accent button */
    &:is(
        [role="menuitemradio"],
        [role="menuitemcheckbox"]
      )[data-state="checked"]
      ${MenuItemLabel} {
      color: ${theme.buttons.secondary.accent.onRest};
    }

    &[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `,
  menuItemVariants(variant),
])

export const MenuSelectionItemIcon = styled(Icon)(
  ({ theme }) => css`
    ${MenuItemAction.__emotion_styles}

    width: ${theme.sizes.s};
    height: ${theme.sizes.s};

    color: ${theme.icons.onSurface};

    @media (hover: hover) and (pointer: fine) {
      ${MenuSelectionItem}:hover & {
        color: ${theme.icons.primary};
      }
    }

    ${MenuSelectionItem}:is(:active, [data-highlighted]) & {
      color: ${theme.icons.primary};
    }
  `,
)

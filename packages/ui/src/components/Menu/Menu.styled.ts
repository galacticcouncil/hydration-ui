import styled from "@emotion/styled"
import { ArrowRight } from "lucide-react"

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
      height: ${theme.sizes.s};
      width: ${theme.sizes.s};
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
      column-gap: ${theme.space.base};
      align-items: center;
      justify-items: start;

      padding: ${theme.space.m} ${theme.containers.paddings.tertiary};

      text-decoration: none;

      &:focus {
        outline: none;
      }
    `,
    menuItemVariants(variant),
  ],
)

export const MenuItemIcon = styled(Icon)`
  grid-row: 1 / -1;
  width: 20px;
  height: 20px;
`

export const MenuItemLabel = styled.span(
  ({ theme }) => css`
    grid-row: 1;
    grid-column: 2;

    &:not(:has(+ ${MenuItemDescription})) {
      grid-row: 1 / -1;
    }

    display: flex;
    align-items: center;
    gap: ${theme.space.s};

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 600;
    font-size: ${theme.fontSizes.p3};
    line-height: ${theme.lineHeights.m};
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

    &:hover:not([disabled]),
    &:active:not([disabled]) {
      background-color: ${theme.buttons.secondary.low.primaryHover};
    }

    &[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `,
  menuItemVariants(variant),
])

export const MenuSelectionItemArrow = styled(ArrowRight)(
  ({ theme }) => css`
    ${MenuItemAction.__emotion_styles}

    width: ${theme.sizes.s};
    height: ${theme.sizes.s};

    color: ${theme.icons.onSurface};

    ${MenuSelectionItem}:hover & {
      color: ${theme.icons.primary};
    }
  `,
)

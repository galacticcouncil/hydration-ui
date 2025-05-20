import styled from "@emotion/styled"
import { ArrowRight } from "lucide-react"

import { Box } from "@/components/Box"
import { Icon } from "@/components/Icon"
import { createVariants, css } from "@/utils"

export type MenuItemVariant = "default" | "filterLink"

const menuItemVariants = createVariants<MenuItemVariant>((theme) => ({
  default: css`
    & ${MenuItemIcon} {
      color: ${theme.icons.soft};
    }

    & ${MenuItemLabel} {
      color: ${theme.text.high};
    }
  `,
  filterLink: css`
    & ${MenuItemIcon} {
      color: ${theme.icons.onSurfaceHover};
      height: 16px;
      width: 16px;
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
      column-gap: 9px;
      align-items: center;
      justify-items: start;

      padding: ${theme.scales.paddings.m}px
        ${theme.containers.paddings.tertiary}px;

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
    gap: ${theme.scales.paddings.s}px;

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 600;
    font-size: ${theme.paragraphSize.p3}px;
    line-height: ${theme.lineHeight.m}px;
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
    font-size: ${theme.paragraphSize.p5}px;
    line-height: ${theme.lineHeight.s}px;
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
}>(({ theme, variant = "default" }) => [
  css`
    border-radius: ${theme.containers.cornerRadius.internalPrimary}px;
    cursor: pointer;

    &:hover,
    &:active {
      background-color: ${theme.buttons.secondary.low.primaryHover};
    }
  `,
  menuItemVariants(variant),
])

export const MenuSelectionItemArrow = styled(ArrowRight)(
  ({ theme }) => css`
    ${MenuItemAction.__emotion_styles}

    width: 18px;
    height: 18px;

    color: ${theme.icons.onSurface};

    ${MenuSelectionItem}:hover & {
      color: ${theme.icons.primary};
    }
  `,
)

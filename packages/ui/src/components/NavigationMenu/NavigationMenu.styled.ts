import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"

import { animations } from "@/styles/animations"

export const SNavigationMenuRoot = styled(NavigationMenuPrimitive.Root)`
  position: relative;
  display: flex;
  z-index: 1;
`

export const SNavigationMenuList = styled(NavigationMenuPrimitive.List)`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0;
`

export const SNavigationMenuItem = styled(NavigationMenuPrimitive.Item)`
  position: relative;
`

export const SNavigationMenuTrigger = styled(NavigationMenuPrimitive.Trigger)(
  ({ theme }) => css`
    height: 1.875rem;
    width: max-content;
    padding: ${theme.space.base} ${theme.space.m};

    display: inline-flex;
    justify-content: center;
    align-items: center;

    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.s};
    color: ${theme.text.medium};
    text-decoration: none;
    white-space: nowrap;

    &[data-status="active"],
    &:hover {
      color: ${theme.text.high};
    }
  `,
)

export const SNavigationMenuContent = styled(NavigationMenuPrimitive.Content)(
  ({ theme }) => css`
    position: absolute;
    top: 100%;
    left: ${theme.space.m};
    width: auto;

    padding: ${theme.containers.paddings.quart};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.radii.xl};

    box-shadow:
      0px 3px 9px 0px rgba(0, 0, 0, 0.04),
      0px 14px 37px 0px rgba(0, 0, 0, 0.04);

    background-color: ${theme.surfaces.themeBasePalette.surfaceHigh};

    animation-duration: 100ms;
    animation-timing-function: ease;

    &[data-state="open"] {
      animation-name: ${animations.scaleInTop};
    }

    &[data-state="closed"] {
      animation-name: ${animations.scaleOutTop};
    }

    &[data-motion="from-start"] {
      opacity: 1 !important;
      animation-name: ${animations.fadeInRight};
    }

    &[data-motion="from-end"] {
      opacity: 1 !important;
      animation-name: ${animations.fadeInLeft};
    }

    &[data-motion="to-start"],
    &[data-motion="to-end"] {
      animation-name: none;
    }
  `,
)

export const SNavigationMenuLink = styled(NavigationMenuPrimitive.Link)(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.base};

    padding: ${theme.space.l};
    white-space: nowrap;
    border-radius: ${theme.radii.m};
    text-decoration: none;

    cursor: pointer;

    &:hover {
      background: ${theme.surfaces.containers.high.hover};
    }
  `,
)

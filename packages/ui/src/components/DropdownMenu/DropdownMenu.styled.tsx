import { css, Theme } from "@emotion/react"
import styled from "@emotion/styled"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ComponentProps, FC } from "react"

import { Separator } from "@/components/Separator"
import { floatingScaleAnimation } from "@/styles/animations"
import { createVariants } from "@/utils"

export type DropdownMenuSize = "small" | "medium" | "large"

export const DropdownMenu = DropdownMenuPrimitive.Root

export const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger)`
  cursor: pointer;
`

const slideBottomAnimation = (theme: Theme) => css`
  animation-duration: 250ms;
  animation-timing-function: ${theme.easings.outExpo};

  &[data-state="open"] {
    animation-name: ${theme.animations.slideInBottom};
  }
  &[data-state="closed"] {
    animation-name: ${theme.animations.slideOutBottom};
  }
`

const sizeVariants = createVariants<DropdownMenuSize>((theme) => ({
  small: css`
    --dropdown-menu-content-vertical-padding: ${theme.space.s};
    --dropdown-menu-content-horizontal-padding: ${theme.space.s};
    --dropdown-menu-content-radius: ${theme.radii.l};
    --menu-item-padding: ${theme.space.base} ${theme.space.base};
    --menu-item-gap: ${theme.space.s};
    --menu-item-font-size: ${theme.fontSizes.p5};
    --menu-item-font-weight: 500;
    --menu-item-line-height: 1.3;
    --menu-item-icon-size: ${theme.sizes.m};
  `,
  medium: css`
    --dropdown-menu-content-vertical-padding: ${theme.buttons.paddings
      .tertiary};
    --dropdown-menu-content-horizontal-padding: ${theme.space.base};
    --dropdown-menu-content-radius: ${theme.radii.xl};
    --menu-item-padding: ${theme.space.m} ${theme.containers.paddings.tertiary};
    --menu-item-gap: ${theme.space.base};
    --menu-item-font-size: ${theme.fontSizes.p3};
    --menu-item-font-weight: 600;
    --menu-item-line-height: 1.3;
    --menu-item-icon-size: ${theme.sizes.l};
  `,
  large: css`
    --dropdown-menu-content-vertical-padding: ${theme.buttons.paddings
      .tertiary};
    --dropdown-menu-content-horizontal-padding: ${theme.space.base};
    --dropdown-menu-content-radius: ${theme.radii.xl};
    --menu-item-padding: ${theme.space.l} ${theme.containers.paddings.secondary};
    --menu-item-gap: ${theme.space.m};
    --menu-item-font-size: ${theme.fontSizes.p2};
    --menu-item-font-weight: 600;
    --menu-item-line-height: 1.3;
    --menu-item-icon-size: ${theme.sizes.xl};
  `,
}))

const SDropdownMenuContent = styled(DropdownMenuPrimitive.Content, {
  shouldForwardProp: (prop) =>
    !["fullWidth", "animation", "size"].includes(prop),
})<{
  readonly fullWidth?: boolean
  readonly animation?: "slide-bottom"
  readonly size?: DropdownMenuSize
}>(({ theme, animation, fullWidth, size = "medium" }) => [
  css`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
    gap: 1px;

    /* a radio group wraps its items, so it repeats the column and its gap */
    & [role="group"] {
      display: inherit;
      flex-direction: inherit;
      gap: inherit;
    }

    ${fullWidth &&
    css`
      width: calc(100vw - 27px);
      margin: 0 13.5px;
    `}

    padding: var(--dropdown-menu-content-vertical-padding)
      var(--dropdown-menu-content-horizontal-padding);
    background-color: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.details.borders};
    border-radius: var(--dropdown-menu-content-radius);

    box-shadow: 0 3px 9px oklch(0 0 none / 0.1);

    z-index: ${theme.zIndices.popover};
  `,
  animation === "slide-bottom"
    ? slideBottomAnimation(theme)
    : floatingScaleAnimation(theme),
  sizeVariants(size),
])

export const DropdownMenuContent: FC<
  ComponentProps<typeof SDropdownMenuContent> & {
    animation?: "slide-bottom"
    mountInRoot?: boolean
  }
> = ({ animation, mountInRoot, ...props }) => {
  const content = (
    <SDropdownMenuContent sideOffset={13} animation={animation} {...props} />
  )

  if (mountInRoot) {
    return (
      <DropdownMenuPrimitive.Portal container={document.getElementById("root")}>
        {content}
      </DropdownMenuPrimitive.Portal>
    )
  }

  return <DropdownMenuPrimitive.Portal>{content}</DropdownMenuPrimitive.Portal>
}

export const DropdownMenuItem = styled(DropdownMenuPrimitive.Item)`
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
  &:focus {
    outline: 2px solid transparent;
  }
`

export const DropdownMenuContentDivider = styled(Separator)(
  ({ theme }) => css`
    width: calc(
      100% + calc(2 * var(--dropdown-menu-content-horizontal-padding))
    );

    margin: ${theme.space.s}
      calc(0px - var(--dropdown-menu-content-horizontal-padding));
  `,
)

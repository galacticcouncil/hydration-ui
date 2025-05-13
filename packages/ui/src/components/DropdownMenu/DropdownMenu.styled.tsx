import { css } from "@emotion/react"
import styled from "@emotion/styled"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ComponentProps, FC } from "react"

import { Separator } from "@/components/Separator"

export const DropdownMenu = DropdownMenuPrimitive.Root

export const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger)`
  cursor: pointer;
`

const SDropdownMenuContent = styled(DropdownMenuPrimitive.Content)<{
  readonly fullWidth?: boolean
}>(
  ({ theme, fullWidth }) => css`
    --dropdown-menu-content-horizontal-padding: ${theme.containers.paddings
      .quart}px;

    display: flex;
    flex-direction: column;
    justify-content: stretch;

    ${fullWidth &&
    css`
      width: calc(100vw - 27px);
      margin: 0 13.5px;
    `}

    padding: ${theme.buttons.paddings.tertiary}px
      var(--dropdown-menu-content-horizontal-padding);
    background-color: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.scales.cornerRadius.xl}px;

    box-shadow: 0px 38px 187px 0px #00000066;
    box-shadow: 0px 3px 9px 0px #0000001a;

    z-index: ${theme.zIndices.popover};
  `,
)

export const DropdownMenuContent: FC<
  ComponentProps<typeof SDropdownMenuContent>
> = (props) => {
  return (
    <DropdownMenuPrimitive.Portal>
      <SDropdownMenuContent sideOffset={13} {...props} />
    </DropdownMenuPrimitive.Portal>
  )
}

export const DropdownMenuItem = styled(DropdownMenuPrimitive.Item)`
  &:focus {
    outline: none;
  }
`

export const DropdownMenuContentDivider = styled(Separator)(
  ({ theme }) => css`
    width: calc(
      100% + calc(2 * var(--dropdown-menu-content-horizontal-padding))
    );

    margin: ${theme.scales.paddings.s}px
      calc(0px - var(--dropdown-menu-content-horizontal-padding));
  `,
)

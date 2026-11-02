import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Button } from "../Button"
import { DropdownMenuContent } from "../DropdownMenu"
import { Icon } from "../Icon"
import { MenuItemLabel } from "../Menu"

export const SSelectTrigger = styled(Button, {
  shouldForwardProp: (prop) => prop !== "fullWidth",
})<{ fullWidth?: boolean }>(
  ({ fullWidth }) => css`
    --button-icon: 0.6em;
    --button-icon-end: -0.4em;

    justify-content: space-between;

    /* the menu opens on press, so the trigger does not scale; !important beats Button's :active rule */
    scale: 1 !important;

    ${fullWidth &&
    css`
      width: 100%;
    `}
  `,
)

export const SSelectContent = styled(DropdownMenuContent)`
  min-width: var(--radix-dropdown-menu-trigger-width);

  /* a list taller than the space beside the trigger scrolls instead of leaving the viewport */
  & [data-radix-scroll-area-viewport] {
    max-height: calc(
      var(--radix-dropdown-menu-content-available-height) - 2 *
        var(--dropdown-menu-content-vertical-padding) - 2px
    );
  }

  /* balances the indicator in front of the label, so the label stays centred in its row */
  & [role="menuitemcheckbox"] ${MenuItemLabel} {
    margin-inline-end: calc(var(--menu-item-icon-size) + var(--menu-item-gap));
  }
`

export const SSelectedIndicator = styled(Icon)`
  grid-row: 1 / -1;

  &[data-state="unchecked"] {
    visibility: hidden;
  }
`

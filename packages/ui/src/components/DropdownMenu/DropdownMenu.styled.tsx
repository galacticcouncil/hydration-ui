import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { Icon } from "@galacticcouncil/ui/components"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { ArrowRight } from "lucide-react"
import { ComponentProps, FC } from "react"

export const DropdownMenu = DropdownMenuPrimitive.Root

export const DropdownMenuTrigger = styled(DropdownMenuPrimitive.Trigger)`
  cursor: pointer;
`

const SDropdownMenuContent = styled(DropdownMenuPrimitive.Content, {
  shouldForwardProp: () => true,
})<{
  readonly fullWidth?: boolean
}>(
  ({ theme, fullWidth }) => css`
    display: flex;
    flex-direction: column;
    justify-content: stretch;

    ${fullWidth &&
    css`
      width: calc(100vw - 27px);
      margin: 0 13.5px;
    `}

    padding: ${theme.buttons.paddings.tertiary}px
      ${theme.containers.paddings.quart}px;
    background-color: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.details.borders};
    border-radius: ${theme.scales.cornerRadius.xl}px;

    box-shadow: 0px 38px 187px 0px #00000066;
    box-shadow: 0px 3px 9px 0px #0000001a;
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

export const DropdownMenuItem = styled(DropdownMenuPrimitive.Item)(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: 1fr 1fr;
    column-gap: 9px;
    align-items: center;
    justify-items: start;

    padding: ${theme.scales.paddings.m}px
      ${theme.containers.paddings.tertiary}px;
    border-radius: ${theme.containers.cornerRadius.internalPrimary}px;

    cursor: pointer;

    &:hover,
    &:active {
      background-color: ${theme.buttons.secondary.low.primaryHover};
      outline: none;
      border: none;
    }
  `,
)

export const DropdownMenuItemIcon = styled(Icon)(
  ({ theme }) => css`
    grid-row: 1 / -1;
    color: ${theme.icons.soft};
  `,
)

export const DropdownMenuItemLabel = styled.span(
  ({ theme }) => css`
    grid-row: 1;
    grid-column: 2;

    &:not(:has(+ ${DropdownMenuItemDescription})) {
      grid-row: 1 / -1;
    }

    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 600;
    font-size: ${theme.paragraphSize.p3}px;
    line-height: ${theme.lineHeight.m}px;
    letter-spacing: 0%;
    text-align: center;

    color: ${theme.text.high};
  `,
)

export const DropdownMenuItemDescription = styled.span(
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

export const DropdownMenuItemArrow = styled(ArrowRight)(
  ({ theme }) => css`
    grid-row: 1 / -1;
    grid-column: 3;

    width: 18px;
    height: 18px;

    color: ${theme.icons.onSurface};

    ${DropdownMenuItem}:hover & {
      color: ${theme.icons.primary};
    }
  `,
)

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { ReactNode } from "react"
import { STrigger, SContent, SItem } from "./Dropdown.styled"

export type TDropdownItem = {
  key: string
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
  disabled?: boolean
}

export function Dropdown(props: {
  items: Array<TDropdownItem>
  children: ReactNode
  onSelect: (key: TDropdownItem) => void
}) {
  return (
    <DropdownMenu.Root>
      <STrigger disabled={!props.items.length}>{props.children}</STrigger>
      <DropdownMenu.Portal>
        <SContent sideOffset={8}>
          {props.items.map((i) => (
            <SItem key={i.key} onClick={() => props.onSelect(i)}>
              {i.icon}
              {i.label}
            </SItem>
          ))}
        </SContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

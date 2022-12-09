import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { ReactNode } from "react"
import { STrigger, SContent, SItem } from "./Dropdown.styled"

export function Dropdown<T extends string>(props: {
  items: Array<{
    key: T
    icon?: ReactNode
    label: ReactNode
  }>
  children: ReactNode
  onSelect: (key: T) => void
}) {
  return (
    <DropdownMenu.Root>
      <STrigger disabled={!props.items.length}>{props.children}</STrigger>
      <DropdownMenu.Portal>
        <SContent sideOffset={8}>
          {props.items.map((i) => (
            <SItem key={i.key} onClick={() => props.onSelect(i.key)}>
              {i.icon}
              {i.label}
            </SItem>
          ))}
        </SContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

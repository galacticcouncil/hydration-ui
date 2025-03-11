import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import React, { ReactNode } from "react"
import { STrigger, SContent, SItem } from "./Dropdown.styled"

export type TDropdownItem<TKey extends string = string> = {
  key: TKey
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
  disabled?: boolean
}

export type DropdownProps<TKey extends string = string> = {
  items: Array<TDropdownItem<TKey>>
  children: ReactNode
  onSelect: (key: TDropdownItem<TKey>) => void
  asChild?: boolean
  align?: "start" | "center" | "end"
  header?: ReactNode
  footer?: ReactNode
  disabled?: boolean
}

export const Dropdown = <TKey extends string = string>({
  items,
  children,
  onSelect,
  asChild,
  align,
  header,
  footer,
  disabled,
}: DropdownProps<TKey>) => {
  return (
    <DropdownMenu.Root>
      {asChild ? (
        <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      ) : (
        <STrigger disabled={!items.length || !!disabled}>{children}</STrigger>
      )}
      <DropdownMenu.Portal>
        <SContent sideOffset={8} align={align}>
          {header}
          {items.map((i) => (
            <SItem
              key={i.key}
              onClick={(e) => {
                e.stopPropagation()
                onSelect(i)
              }}
            >
              {i.icon}
              {i.label}
            </SItem>
          ))}
          {footer}
        </SContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

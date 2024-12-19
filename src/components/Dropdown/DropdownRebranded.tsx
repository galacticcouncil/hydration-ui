import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import React, { ReactNode } from "react"
import { SContent, SItem, STrigger } from "./DropdownRebranded.styled"
import { Text } from "components/Typography/Text/Text"
import Chevron from "assets/icons/ChevronFull.svg?react"
import { Icon } from "components/Icon/Icon"

export type TDropdownItem = {
  key: string
  icon?: ReactNode
  label: ReactNode
  onSelect?: () => void
  disabled?: boolean
}

export type DropdownProps = {
  items: Array<TDropdownItem>
  children: ReactNode
  onSelect: (key: TDropdownItem) => void
  asChild?: boolean
  align?: "start" | "center" | "end"
}

export const Dropdown: React.FC<DropdownProps> = ({
  items,
  children,
  onSelect,
  asChild,
  align,
}) => {
  return (
    <DropdownMenu.Root>
      {asChild ? (
        <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      ) : (
        <STrigger disabled={!items.length}>{children}</STrigger>
      )}
      <DropdownMenu.Portal>
        <SContent sideOffset={8} align={align}>
          {items.map((i) => (
            <SItem key={i.key} onClick={() => onSelect(i)}>
              {i.icon}
              {i.label}
            </SItem>
          ))}
        </SContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export const DropdownTriggerContent = ({
  title,
  value,
}: {
  title: string
  value?: string
}) => {
  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <Text fs={12} lh={16} css={{ color: "#AEB0B7" }}>
        {title}:
      </Text>
      <Text fs={12} lh={16} color="white">
        {value}
      </Text>
      <Icon icon={<Chevron />} sx={{ color: "basic400" }} />
    </div>
  )
}

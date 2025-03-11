import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

import { ReactNode } from "react"
import { SContent, SItem, STrigger } from "./DropdownRebranded.styled"
import { Text } from "components/Typography/Text/Text"
import Chevron from "assets/icons/ChevronFull.svg?react"
import { Icon } from "components/Icon/Icon"

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
  asChild?: boolean
  closeOnSelect?: boolean
  fullWidth?: boolean
  align?: "start" | "center" | "end"
  onSelect: (key: TDropdownItem<TKey>) => void
  renderTrail?: (item: TDropdownItem<TKey>) => ReactNode
}

export const Dropdown = <TKey extends string = string>({
  items,
  children,
  asChild,
  closeOnSelect = true,
  align,
  fullWidth,
  onSelect,
  renderTrail,
}: DropdownProps<TKey>) => {
  return (
    <DropdownMenu.Root>
      {asChild ? (
        <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      ) : (
        <STrigger disabled={!items.length}>{children}</STrigger>
      )}
      <DropdownMenu.Portal>
        <SContent sideOffset={8} align={align} fullWidth={fullWidth}>
          {items.map((i) => (
            <SItem
              key={i.key}
              onClick={(e) => {
                if (!closeOnSelect) {
                  e.preventDefault()
                }
                onSelect(i)
              }}
            >
              {i.icon}
              {i.label}
              {renderTrail?.(i)}
            </SItem>
          ))}
        </SContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

export type DropdownTriggerContentProps = {
  title: string
  value?: string
}

export const DropdownTriggerContent = ({
  title,
  value,
}: DropdownTriggerContentProps) => {
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

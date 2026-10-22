import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import { CaretDown, Check } from "@/assets/icons"
import { getToken } from "@/utils"

import { SButtonProps } from "../Button"
import { Flex } from "../Flex"
import { Icon } from "../Icon"
import { MenuItemLabel, MenuSelectionItem } from "../Menu"
import { ScrollArea } from "../ScrollArea"
import { Text } from "../Text"
import {
  SSelectContent,
  SSelectedIndicator,
  SSelectTrigger,
} from "./Select.styled"

const selectedIndicator = (
  <DropdownMenuPrimitive.ItemIndicator asChild forceMount>
    <SSelectedIndicator
      component={Check}
      size="var(--menu-item-icon-size)"
      color={getToken("buttons.secondary.accent.onRest")}
    />
  </DropdownMenuPrimitive.ItemIndicator>
)

export type SelectItem<TKey extends string> = {
  key: TKey
  label: string
  icon?: React.ComponentType
}

type SelectionProps<TKey extends string> =
  | {
      multiple?: false
      value?: NoInfer<TKey>
      onValueChange: (value: NoInfer<TKey>) => void
    }
  | {
      multiple: true
      value?: ReadonlyArray<NoInfer<TKey>>
      onValueChange: (value: ReadonlyArray<NoInfer<TKey>>) => void
    }

export type SelectProps<TKey extends string> = SButtonProps &
  SelectionProps<TKey> & {
    items: ReadonlyArray<SelectItem<TKey>>
    label?: string
    placeholder?: string
    disabled?: boolean
    fullWidth?: boolean
    className?: string
    onCloseAutoFocus?: (event: Event) => void
  }

export const Select = <TKey extends string = string>({
  items,
  label,
  placeholder,
  multiple,
  value,
  onValueChange,
  onCloseAutoFocus,
  fullWidth,
  disabled,
  variant = "muted",
  outline = true,
  size = "small",
  ...triggerProps
}: SelectProps<TKey>) => {
  const selection = { multiple, value, onValueChange } as SelectionProps<TKey>
  const selectedKeys = selection.multiple
    ? (selection.value ?? [])
    : selection.value !== undefined
      ? [selection.value]
      : []

  const selectedItems = items.filter((item) => selectedKeys.includes(item.key))

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        <SSelectTrigger
          variant={variant}
          outline={outline}
          size={size}
          iconEnd={CaretDown}
          fullWidth={fullWidth}
          {...triggerProps}
        >
          <Flex as="span" gap="0.4em">
            {label && (
              <Text as="span" color={getToken("text.high")}>
                {label}:
              </Text>
            )}
            {selectedItems.length
              ? selectedItems.map((item, index) => (
                  <Flex key={item.key} as="span" align="center" gap="0.3em">
                    {item.icon && (
                      <Icon
                        size="1.15em"
                        sx={
                          index === 0
                            ? { marginInlineStart: "-0.5em" }
                            : undefined
                        }
                        component={item.icon}
                      />
                    )}
                    {item.label}
                    {index < selectedItems.length - 1 && ","}
                  </Flex>
                ))
              : placeholder}
          </Flex>
        </SSelectTrigger>
      </DropdownMenuPrimitive.Trigger>
      <SSelectContent
        sideOffset={6}
        align="start"
        collisionPadding={12}
        onCloseAutoFocus={onCloseAutoFocus}
        size="small"
      >
        <ScrollArea>
          <Flex direction="column" gap="1px">
            {selection.multiple ? (
              items.map((item) => {
                const isSelected = selectedKeys.includes(item.key)

                return (
                  <DropdownMenuPrimitive.CheckboxItem
                    key={item.key}
                    asChild
                    checked={isSelected}
                    // keeps the menu open so several items can be picked in one go
                    onSelect={(e) => e.preventDefault()}
                    onCheckedChange={() =>
                      selection.onValueChange(
                        isSelected
                          ? selectedKeys.filter((key) => key !== item.key)
                          : [...selectedKeys, item.key],
                      )
                    }
                  >
                    <MenuSelectionItem variant="filterLink">
                      {selectedIndicator}
                      <MenuItemLabel>
                        {item.icon && <Icon size="s" component={item.icon} />}
                        {item.label}
                      </MenuItemLabel>
                    </MenuSelectionItem>
                  </DropdownMenuPrimitive.CheckboxItem>
                )
              })
            ) : (
              <DropdownMenuPrimitive.RadioGroup
                value={selection.value}
                onValueChange={(key) => selection.onValueChange(key as TKey)}
              >
                {items.map((item) => (
                  <DropdownMenuPrimitive.RadioItem
                    key={item.key}
                    asChild
                    value={item.key}
                  >
                    <MenuSelectionItem variant="filterLink">
                      <MenuItemLabel>
                        {item.icon && <Icon size="s" component={item.icon} />}
                        {item.label}
                      </MenuItemLabel>
                    </MenuSelectionItem>
                  </DropdownMenuPrimitive.RadioItem>
                ))}
              </DropdownMenuPrimitive.RadioGroup>
            )}
          </Flex>
        </ScrollArea>
      </SSelectContent>
    </DropdownMenuPrimitive.Root>
  )
}

import * as Popover from "@radix-ui/react-popover"
import { Command } from "cmdk"
import { Check } from "lucide-react"

import { Icon } from "@/components/Icon"
import {
  SelectCaret,
  SelectItem,
  SelectLabel,
} from "@/components/Select/Select"
import {
  SContent,
  SelectTrigger,
  SItem,
  SViewport,
} from "@/components/Select/Select.styled"

const ComboboxTrigger = SelectTrigger.withComponent(Popover.PopoverTrigger)
const ComboboxContent = SContent.withComponent(Popover.PopoverContent)
const ComboboxGroup = SViewport.withComponent(Command.Group)
const ComboboxItem = SItem.withComponent(Command.Item)

type Props<TKey extends string> = {
  readonly items: ReadonlyArray<SelectItem<TKey>>
  readonly selectedItems?: ReadonlyArray<TKey>
  readonly label?: string
  readonly placeholder?: string
  readonly className?: string
  readonly onSelectionChange: (values: ReadonlyArray<TKey>) => void
}

export const Combobox = <TKey extends string>({
  label,
  placeholder,
  items,
  selectedItems,
  className,
  onSelectionChange,
}: Props<TKey>) => {
  return (
    <Popover.Root>
      <ComboboxTrigger className={className}>
        {label && <SelectLabel>{label}</SelectLabel>}
        {!selectedItems?.length
          ? placeholder
          : selectedItems
              .map((item) => items.find((i) => i.key === item)?.label)
              .filter(Boolean)
              .join(", ")}
        <SelectCaret />
      </ComboboxTrigger>
      <ComboboxContent sx={{ minWidth: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <Command.List>
            <ComboboxGroup>
              {items.map((item) => {
                const isSelected = selectedItems?.includes(item.key)

                return (
                  <ComboboxItem
                    key={item.key}
                    value={item.key}
                    onSelect={() => {
                      onSelectionChange(
                        isSelected
                          ? (selectedItems?.filter((key) => key !== item.key) ??
                              [])
                          : [...(selectedItems ?? []), item.key],
                      )
                    }}
                  >
                    {item.label}
                    {isSelected && <Icon size={12} component={Check} />}
                  </ComboboxItem>
                )
              })}
            </ComboboxGroup>
          </Command.List>
        </Command>
      </ComboboxContent>
    </Popover.Root>
  )
}

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  FlexProps,
  MenuItemLabel,
  MenuSelectionItem,
  Text,
} from "@galacticcouncil/ui/components"
import { ChevronDown } from "lucide-react"
import { ReactNode, useState } from "react"

export type HeaderSelectOption<TKey extends string> = {
  readonly key: TKey
  readonly label: string
  readonly icon?: ReactNode
}

type Props<TKey extends string> = Omit<FlexProps, "onChange"> & {
  readonly label: string
  readonly options: readonly HeaderSelectOption<TKey>[]
  readonly value: TKey
  readonly onChange: (value: TKey) => void
}

/** The row that opens an action form: what is being chosen, and the choice. */
export const HeaderSelect = <TKey extends string>({
  label,
  options,
  value,
  onChange,
  ...props
}: Props<TKey>) => {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.key === value)

  return (
    <Flex
      justify="space-between"
      align="center"
      direction={["column", "row"]}
      gap="base"
      {...props}
    >
      <Text fs="p3" fw={700} lh={1}>
        {label}
      </Text>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            iconEnd={ChevronDown}
            type="button"
            size="medium"
            variant="tertiary"
            outline
          >
            {selected?.icon && <Flex ml="-base">{selected?.icon}</Flex>}
            {selected?.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option) => (
            <DropdownMenuItem key={option.key} asChild>
              <MenuSelectionItem
                sx={{ display: "flex", alignItems: "center" }}
                onClick={() => {
                  onChange(option.key)
                  setOpen(false)
                }}
              >
                {option.icon}
                <MenuItemLabel>{option.label}</MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </Flex>
  )
}

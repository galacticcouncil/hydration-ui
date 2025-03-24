import { ItemText, Root, SelectProps, Value } from "@radix-ui/react-select"

import { CaretDown } from "@/assets/icons"
import { getToken } from "@/utils"

import { Icon } from "../Icon"
import { Text } from "../Text"
import { SContent, SelectTrigger, SItem, SViewport } from "./Select.styled"

export type SelectItem<TKey extends string> = {
  key: TKey
  label: string
}

type SelectPropsCustom<TKey extends string> = Omit<
  SelectProps,
  "onValueChange"
> & {
  label?: string
  placeholder?: string
  items: ReadonlyArray<SelectItem<TKey>>
  onValueChange: (value: TKey) => void
}

export const Select = <TKey extends string = string>({
  label,
  placeholder,
  items,
  ...props
}: SelectPropsCustom<TKey>) => {
  return (
    <Root {...props}>
      <SelectTrigger>
        {label && <SelectLabel>{label}</SelectLabel>}
        <Value placeholder={placeholder} />
        <SelectCaret />
      </SelectTrigger>

      <SContent sideOffset={6} align="center" position="popper">
        <SViewport>
          {items.map((item) => (
            <SItem key={item.key} value={item.key}>
              <ItemText>{item.label}</ItemText>
            </SItem>
          ))}
        </SViewport>
      </SContent>
    </Root>
  )
}

type SelectLabelProps = {
  readonly children: React.ReactNode
}

export const SelectLabel = ({ children }: SelectLabelProps) => (
  <Text fs={12} fw={600} color={getToken("text.medium")}>
    {children}
  </Text>
)

export const SelectCaret = () => (
  <Icon size={8} component={CaretDown} color={getToken("colors.greys.400")} />
)

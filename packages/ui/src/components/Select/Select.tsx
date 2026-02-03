import {
  ItemText,
  Root,
  SelectProps,
  Trigger,
  Value,
} from "@radix-ui/react-select"
import { ReactNode } from "react"

import { CaretDown } from "@/assets/icons"
import { getToken } from "@/utils"

import { Icon } from "../Icon"
import { Text } from "../Text"
import { SContent, SelectTrigger, SItem, SViewport } from "./Select.styled"

export type SelectItem<TKey extends string> = {
  key: TKey
  label: string
}

type RenderProps =
  | {
      label?: string
      renderTrigger?: never
    }
  | {
      label?: never
      renderTrigger: () => ReactNode
    }

type SelectPropsCustom<TKey extends string> = Omit<
  SelectProps,
  "onValueChange"
> &
  RenderProps & {
    placeholder?: string
    items: ReadonlyArray<SelectItem<TKey>>
    onValueChange: (value: TKey) => void
  }

export const Select = <TKey extends string = string>({
  label,
  placeholder,
  items,
  renderTrigger,
  ...props
}: SelectPropsCustom<TKey>) => {
  return (
    <Root {...props}>
      {renderTrigger ? (
        <Trigger sx={{ cursor: "pointer" }}>{renderTrigger()}</Trigger>
      ) : (
        <SelectTrigger>
          {label && <SelectLabel>{label}</SelectLabel>}
          <Value placeholder={placeholder} />
          <SelectCaret />
        </SelectTrigger>
      )}
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
  <Text fs="p5" fw={600} color={getToken("text.medium")}>
    {children}
  </Text>
)

export const SelectCaret = () => (
  <Icon size={8} component={CaretDown} color={getToken("colors.greys.400")} />
)

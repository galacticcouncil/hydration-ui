import { ItemText, Root, SelectProps, Value } from "@radix-ui/react-select"

import { ChevronDown } from "@/assets/icons"
import { useThemeUI } from "@/theme/provider"

import { Icon } from "../Icon"
import { Text } from "../Text"
import { SContent, SelectTrigger, SItem, SViewport } from "./Select.styled"

type SelectPropsCustom = {
  label?: string
  placeholder?: string
  items: { key: string; label: string }[]
} & SelectProps

export const Select = ({
  label,
  placeholder,
  items,
  ...props
}: SelectPropsCustom) => {
  const { theme } = useThemeUI()

  return (
    <Root {...props}>
      <SelectTrigger>
        {label && (
          <Text fs={12} fw={600} color={theme.text.medium}>
            {label}
          </Text>
        )}
        <Value placeholder={placeholder} />
        <Icon
          size={18}
          component={ChevronDown}
          color={theme.colors.greys[400]}
        />
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

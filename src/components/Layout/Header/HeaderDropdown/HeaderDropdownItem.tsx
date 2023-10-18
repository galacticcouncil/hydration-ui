import React, { ComponentPropsWithoutRef, ReactNode } from "react"
import { Icon } from "components/Icon/Icon"
import {
  SItemButton,
  SItemLink,
} from "components/Layout/Header/HeaderDropdown/HeaderDropdown.styled"
import { Text } from "components/Typography/Text/Text"
import IconArrow from "assets/icons/IconArrow.svg?react"

type ItemHtmlAttributes = ComponentPropsWithoutRef<typeof SItemLink> &
  ComponentPropsWithoutRef<typeof SItemButton>

export type HeaderDropdownItemProps = ItemHtmlAttributes & {
  icon: ReactNode
  onClick?: () => void
  title: string
  subtitle?: string
}

export const HeaderDropdownItem: React.FC<HeaderDropdownItemProps> = ({
  icon,
  onClick,
  title,
  subtitle,
  ...props
}) => {
  const isButton = !!onClick
  const Item = isButton ? SItemButton : SItemLink
  return (
    <Item onClick={onClick} {...props} as="button">
      {icon && <Icon sx={{ color: "brightBlue200" }} icon={icon} />}
      <div sx={{ flex: "column", gap: 3 }}>
        <Text fs={14} lh={14} fw={600} color="basic100">
          {title}
        </Text>
        {subtitle && (
          <Text fs={12} lh={18} fw={400} color="basic500">
            {subtitle}
          </Text>
        )}
      </div>
      <IconArrow />
    </Item>
  )
}

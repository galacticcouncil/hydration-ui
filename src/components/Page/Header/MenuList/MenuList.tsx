import { FC } from "react"
import { MenuItem, MenuItemProps } from "../MenuItem/MenuItem"

type MenuListProps = {
  items: MenuItemProps[]
}

export const MenuList: FC<MenuListProps> = ({ items }) => (
  <div sx={{ flex: "row", gap: 30 }}>
    {items.map((item, index) => (
      <MenuItem key={index} text={item.text} active={item.active} />
    ))}
  </div>
)

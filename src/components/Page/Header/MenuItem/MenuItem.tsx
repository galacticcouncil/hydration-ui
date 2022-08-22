import { FC } from "react"
import { SMenuItem } from "./MenuItem.styled"

export type MenuItemProps = {
  text: string
  active?: boolean
}
export const MenuItem: FC<MenuItemProps> = ({ active, text }) => (
  <SMenuItem active={active}>{text}</SMenuItem>
)

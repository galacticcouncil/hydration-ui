import { FC } from "react";
import { StyledMenuItem } from "./MenuItem.styled";

export type MenuItemProps = {
  text: string;
  active?: boolean;
};
export const MenuItem: FC<MenuItemProps> = ({ active, text }) => (
  <StyledMenuItem active={active}>{text}</StyledMenuItem>
);

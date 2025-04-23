import { ReactNode } from "react"
import { SItems } from "components/Layout/Header/HeaderDropdown/HeaderDropdown.styled"

export type HeaderDropdownItemsProps = {
  children: ReactNode
}

export const HeaderDropdownItems: React.FC<HeaderDropdownItemsProps> = ({
  children,
}) => {
  return <SItems>{children}</SItems>
}

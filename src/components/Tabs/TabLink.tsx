import { Link, useSearch } from "@tanstack/react-location"
import { ReactNode } from "react"
import { ButtonProps } from "components/Button/Button"
import { SButton } from "./TabLink.styled"

type Props = ButtonProps & {
  to: string
  icon?: ReactNode
  isActive?: boolean
  fullWidth?: boolean
}

export const TabLink = ({ to, children, icon, fullWidth }: Props) => {
  const search = useSearch()

  return (
    <Link to={to} search={search} sx={{ width: fullWidth ? "100%" : "auto" }}>
      {({ isActive }) => (
        <SButton variant="outline" active={isActive} fullWidth={fullWidth}>
          {icon}
          {children}
        </SButton>
      )}
    </Link>
  )
}

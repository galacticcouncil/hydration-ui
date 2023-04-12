import { Link, useSearch } from "@tanstack/react-location"
import { ReactNode } from "react"
import { Button, ButtonProps } from "../Button/Button"

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
        <Button
          variant="outline"
          active={isActive}
          sx={{
            p: "12px 34px",
            width: fullWidth ? "100%" : "auto",
          }}
        >
          {icon}
          {children}
        </Button>
      )}
    </Link>
  )
}

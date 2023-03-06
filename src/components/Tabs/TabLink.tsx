import { Button, ButtonProps } from "../Button/Button"
import { FC, ReactNode } from "react"
import { Link, Search } from "@tanstack/react-location"

type TabLinkProps = ButtonProps & {
  to: string
  icon?: ReactNode
  isActive?: boolean
  fullWidth?: boolean
  search?: Search<unknown>
}

export const TabLink: FC<TabLinkProps> = ({
  to,
  children,
  icon,
  fullWidth,
  search,
}) => (
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

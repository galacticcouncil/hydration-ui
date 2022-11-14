import { Button, ButtonProps } from "../Button/Button"
import { FC, ReactNode } from "react"
import { Link } from "@tanstack/react-location"

type TabLinkProps = ButtonProps & {
  to: string
  icon?: ReactNode
  isActive?: boolean
  fullWidth?: boolean
}

export const TabLink: FC<TabLinkProps> = ({
  to,
  children,
  icon,
  fullWidth,
}) => (
  <Link to={to} sx={{ width: fullWidth ? "100%" : "auto" }}>
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

import { Button, ButtonProps } from "../Button/Button"
import { FC, ReactNode } from "react"
import { Link } from "@tanstack/react-location"

type TabLinkProps = ButtonProps & {
  to: string
  icon?: ReactNode
  isActive?: boolean
}

export const TabLink: FC<TabLinkProps> = ({ to, children, icon }) => (
  <Link to={to}>
    {({ isActive }) => (
      <Button
        variant="outline"
        active={isActive}
        sx={{
          p: "12px 34px",
        }}
        transform="none"
      >
        {icon}
        {children}
      </Button>
    )}
  </Link>
)

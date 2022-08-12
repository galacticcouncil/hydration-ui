import { Link as RouterLink } from "react-router-dom"
import { FC, ReactNode } from "react"

export type LinkProps = {
  to: string
  children: ReactNode
}

export const Link: FC<LinkProps> = ({ to, children }) => (
  <RouterLink to={to}>{children}</RouterLink>
)

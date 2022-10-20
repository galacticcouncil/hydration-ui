import { Link as RouterLink, LinkProps } from "@tanstack/react-location"
import { FC } from "react"

export const Link: FC<LinkProps> = ({ to, children }) => (
  <RouterLink to={to}>{children}</RouterLink>
)

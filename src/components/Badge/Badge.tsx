import { FC, ReactNode } from "react"
import { SBadge, sizeStyles, variantStyles } from "./Badge.styled"

export type BadgeProps = {
  children?: ReactNode
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
}

export const Badge: FC<BadgeProps> = ({
  variant = "primary",
  size = "medium",
  children,
}) => {
  return (
    <SBadge variant={variant} size={size}>
      {children}
    </SBadge>
  )
}

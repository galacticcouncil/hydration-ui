import { FC, ReactNode } from "react"
import { SBadge, sizeStyles, variantStyles } from "./Badge.styled"

export type BadgeProps = {
  children?: ReactNode
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  rounded?: boolean
  className?: string
}

export const Badge: FC<BadgeProps> = ({
  variant = "primary",
  size = "medium",
  rounded = true,
  children,
  className,
}) => {
  return (
    <SBadge
      variant={variant}
      size={size}
      rounded={rounded}
      className={className}
    >
      {children}
    </SBadge>
  )
}

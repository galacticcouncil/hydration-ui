import { ComponentType, FC, ReactNode } from "react"

import { Icon } from "@/components/Icon"
import { SMainTabContainer } from "@/components/MainTab/MainTab.styled"

type Props = {
  readonly children: ReactNode
  readonly icon?: ComponentType
  readonly isActive?: boolean
  readonly className?: string
  readonly onClick?: () => void
}

export const MainTab: FC<Props> = ({
  children,
  icon,
  isActive,
  className,
  onClick,
}) => {
  return (
    <SMainTabContainer
      isActive={isActive}
      className={className}
      onClick={onClick}
    >
      {icon && <Icon component={icon} size={14} />}
      {children}
    </SMainTabContainer>
  )
}

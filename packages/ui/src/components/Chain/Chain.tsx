import { ComponentType, FC } from "react"
import { useTranslation } from "react-i18next"

import { SChainContainer } from "@/components/Chain/Chain.styled"
import { Icon } from "@/components/Icon"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

type Props = {
  readonly icon: ComponentType
  readonly name: string
  readonly className?: string
  readonly onClick?: () => void
  readonly variant?: "desktop" | "mobile"
  readonly isActive?: boolean
}

export const Chain: FC<Props> = ({
  icon,
  name,
  className,
  onClick,
  variant,
  isActive,
}) => {
  const { t } = useTranslation()

  return (
    <SChainContainer
      tabIndex={0}
      className={className}
      variant={variant}
      onClick={onClick}
      isActive={isActive}
    >
      <Icon component={icon} />
      <div>
        <Text fw={500} fs="p5" lh={1.1} color={getToken("text.high")}>
          {name}
        </Text>
        <Text fw={500} fs="p6" lh="xs" color={getToken("text.medium")}>
          {isActive ? t("connected") : t("connect")}
        </Text>
      </div>
    </SChainContainer>
  )
}

import { ComponentType, FC, ReactNode } from "react"

import { CircleInfo, ExclamationMark, TriangleAlert } from "@/assets/icons"
import {
  AlertVariant,
  SAlertContainer,
  SAlertIcon,
  SAlertTitle,
} from "@/components/Alert/Alert.styled"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

export type AlertProps = {
  readonly variant?: AlertVariant
  readonly title?: string
  readonly description: ReactNode
  readonly action?: ReactNode
  readonly className?: string
  readonly displayIcon?: boolean
}

export const Alert: FC<AlertProps> = ({
  variant = "info",
  title,
  description,
  action,
  className,
  displayIcon = true,
}) => {
  return (
    <SAlertContainer variant={variant} className={className}>
      {displayIcon && (
        <SAlertIcon
          variant={variant}
          size={16}
          component={alertIcons[variant]}
        />
      )}

      <Flex direction="column" gap={8} align="baseline">
        {title && <SAlertTitle variant={variant}>{title}</SAlertTitle>}
        {typeof description === "string" ? (
          <Text
            fw={title ? 400 : 500}
            fs={13}
            lh={1.3}
            color={getToken("text.high")}
          >
            {description}
          </Text>
        ) : (
          description
        )}
        {action}
      </Flex>
    </SAlertContainer>
  )
}

const alertIcons: Record<AlertVariant, ComponentType> = {
  info: CircleInfo,
  warning: TriangleAlert,
  error: ExclamationMark,
}

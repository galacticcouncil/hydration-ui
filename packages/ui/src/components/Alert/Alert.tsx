import { FC, ReactNode } from "react"

import { CircleInfo, TriangleAlert } from "@/assets/icons"
import {
  AlertVariant,
  SAlertContainer,
  SAlertIcon,
  SAlertTitle,
} from "@/components/Alert/Alert.styled"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

type Props = {
  readonly variant?: AlertVariant
  readonly title?: string
  readonly description: string | ReactNode
  readonly className?: string
  readonly displayIcon?: boolean
}

export const Alert: FC<Props> = ({
  variant = "info",
  title,
  description,
  className,
  displayIcon = true,
}) => {
  return (
    <SAlertContainer variant={variant} className={className}>
      {displayIcon && (
        <SAlertIcon
          variant={variant}
          component={variant === "warning" ? TriangleAlert : CircleInfo}
        />
      )}

      <Flex direction="column" gap={8}>
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
      </Flex>
    </SAlertContainer>
  )
}

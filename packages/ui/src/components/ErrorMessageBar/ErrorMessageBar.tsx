import { TriangleAlert } from "lucide-react"
import { FC } from "react"

import { HelpIcon } from "@/assets/icons"
import {
  ErrorMessageBarVariant,
  SErrorMessageBarContainer,
  SErrorMessageBarIcon,
  SErrorMessageBarTitle,
} from "@/components/ErrorMessageBar/ErrorMessageBar.styled"
import { Flex } from "@/components/Flex"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

type Props = {
  readonly variant?: ErrorMessageBarVariant
  readonly title?: string
  readonly description: string
  readonly className?: string
}

export const ErrorMessageBar: FC<Props> = ({
  variant = "info",
  title,
  description,
  className,
}) => {
  return (
    <SErrorMessageBarContainer variant={variant} className={className}>
      <SErrorMessageBarIcon
        variant={variant}
        component={variant === "warning" ? TriangleAlert : HelpIcon}
      />
      <Flex direction="column" gap={8}>
        {title && (
          <SErrorMessageBarTitle variant={variant}>
            {title}
          </SErrorMessageBarTitle>
        )}
        <Text
          fw={title ? 400 : 500}
          fs={13}
          lh={1.3}
          color={getToken("text.high")}
        >
          {description}
        </Text>
      </Flex>
    </SErrorMessageBarContainer>
  )
}

import { Icon, ModalBody, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { ComponentType, FC, ReactNode } from "react"

type BankMessageProps = {
  icon: ComponentType
  title: string
  description?: string
  children?: ReactNode
}

/** One centred step of the bank set-up: icon, title, text, then its actions. */
export const BankMessage: FC<BankMessageProps> = ({
  icon,
  title,
  description,
  children,
}) => (
  <ModalBody>
    <Stack gap="l" align="center">
      <Icon component={icon} size="xl" color={getToken("text.medium")} />
      <Stack gap="s" align="center">
        <Text fs="p2" fw={500} font="primary" align="center">
          {title}
        </Text>
        {description && (
          <Text fs="p4" align="center" color={getToken("text.medium")}>
            {description}
          </Text>
        )}
      </Stack>
      {children && (
        <Stack gap="m" width="100%">
          {children}
        </Stack>
      )}
    </Stack>
  </ModalBody>
)

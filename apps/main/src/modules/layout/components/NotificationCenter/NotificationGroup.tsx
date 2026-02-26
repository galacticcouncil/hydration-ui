import { Collapsible, Stack, Text } from "@galacticcouncil/ui/components"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

type NotificationGroupProps = {
  label: string
  defaultOpen?: boolean
  children: ReactNode
}

export const NotificationGroup: FC<NotificationGroupProps> = ({
  label,
  defaultOpen,
  children,
}) => {
  const { t } = useTranslation()

  return (
    <Collapsible
      label={
        <Text as="h3" fs="p3" fw={600}>
          {label}
        </Text>
      }
      actionLabel={t("show")}
      actionLabelWhenOpen={t("hide")}
      defaultOpen={defaultOpen}
    >
      <Stack gap="m">{children}</Stack>
    </Collapsible>
  )
}

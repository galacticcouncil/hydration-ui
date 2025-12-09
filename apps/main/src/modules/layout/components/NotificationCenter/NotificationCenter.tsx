import { Bell as BellIcon } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonIcon,
  Collapsible,
  Icon,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetRoot,
  SheetTrigger,
  Spinner,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { EmptyState } from "@/components/EmptyState/EmptyState"
import { NotificationToast } from "@/modules/layout/components/NotificationCenter/NotificationToast"
import { useToasts } from "@/states/toasts"

export const NotificationCenter: FC = () => {
  const { t } = useTranslation()

  const { toasts } = useToasts()

  const groups = Object.groupBy(toasts, (toast) =>
    toast.variant === "pending" ? "pending" : "completed",
  )

  const pending = groups.pending ?? []
  const completed = groups.completed ?? []

  return (
    <SheetRoot>
      <SheetTrigger asChild>
        <ButtonIcon>
          <Icon component={BellIcon} size={20} />
          {pending.length > 0 && (
            <Spinner
              sx={{
                position: "absolute",
                inset: 0,
                size: "100%",
                strokeWidth: 1,
              }}
            />
          )}
        </ButtonIcon>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader title={t("notifications")} />
        <SheetBody sx={{ pt: 10 }}>
          <Stack gap={20}>
            {pending.length > 0 && (
              <Collapsible
                label={
                  <Text as="h3" fs={14} fw={600}>
                    {t("pending")}
                  </Text>
                }
                actionLabel={t("show")}
                actionLabelWhenOpen={t("hide")}
                defaultOpen
              >
                <Stack gap={12}>
                  {pending.map((props) => (
                    <NotificationToast key={props.id} {...props} />
                  ))}
                </Stack>
              </Collapsible>
            )}

            {completed.length > 0 && (
              <Collapsible
                label={
                  <Text as="h3" fs={14} fw={600}>
                    {t("completed")}
                  </Text>
                }
                actionLabel={t("show")}
                actionLabelWhenOpen={t("hide")}
                defaultOpen
              >
                <Stack gap={12}>
                  {completed.map((props) => (
                    <NotificationToast key={props.id} {...props} />
                  ))}
                </Stack>
              </Collapsible>
            )}

            {toasts.length === 0 && (
              <EmptyState
                header={t("notifications.empty.title")}
                description={t("notifications.empty.description")}
              />
            )}
          </Stack>
        </SheetBody>
      </SheetContent>
    </SheetRoot>
  )
}

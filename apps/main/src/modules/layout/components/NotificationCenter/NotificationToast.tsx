import { Notification } from "@galacticcouncil/ui/components"

import { useRelativeDate } from "@/hooks/useRelativeDate"
import { ToastData } from "@/states/toasts"

export const NotificationToast: React.FC<ToastData> = ({
  variant,
  title,
  link,
  hint,
  dateCreated,
}) => {
  const dateString = useRelativeDate(new Date(dateCreated))

  return (
    <Notification
      fullWidth
      autoClose={false}
      variant={variant}
      content={title}
      dateString={dateString}
      link={link}
      hint={hint}
    />
  )
}

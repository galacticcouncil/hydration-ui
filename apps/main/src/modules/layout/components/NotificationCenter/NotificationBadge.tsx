import { SBadge } from "@/modules/layout/components/NotificationCenter/NotificationBadge.styled"

const MAX_VISIBLE_COUNT = 9

export type NotificationBadgeProps = {
  count: number
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
}) => {
  if (count <= 0) return null
  return (
    <SBadge>
      {count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : count}
    </SBadge>
  )
}

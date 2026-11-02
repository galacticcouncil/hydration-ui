import { SBadge } from "@/modules/layout/components/NotificationCenter/NotificationBadge.styled"

const MAX_VISIBLE_COUNT = 9

export type NotificationBadgeProps = {
  count: number
  className?: string
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
}) => {
  if (count <= 0) return null
  return (
    <SBadge className={className}>
      {count > MAX_VISIBLE_COUNT ? `${MAX_VISIBLE_COUNT}+` : count}
    </SBadge>
  )
}

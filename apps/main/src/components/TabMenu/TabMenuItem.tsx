import {
  Button,
  ButtonSize,
  ButtonVariant,
  Icon,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { FC, useMemo } from "react"

import { TabItem } from "@/components/TabMenu/TabMenu"
import { TabMenuBadge } from "@/components/TabMenu/TabMenuBadge"

export type Props = {
  readonly item: TabItem
  readonly size?: ButtonSize
  readonly badge?: number | string
  readonly variant?: ButtonVariant
  readonly activeVariant?: ButtonVariant
  readonly className?: string
  readonly ignoreCurrentSearch?: boolean
}

export const TabMenuItem: FC<Props> = ({
  item,
  size,
  badge,
  activeVariant = "secondary",
  variant = "muted",
  className,
  ignoreCurrentSearch,
}) => {
  const { to, title, icon: IconComponent, search, resetScroll, exact } = item

  const path = useLocation({
    select: (state) => state.pathname,
  })

  const currentSearch = useLocation({
    select: (state) => state.search,
  })

  const isActive = useMemo(() => {
    const normalizedPath = path.replace(/\/$/, "") || "/"
    const normalizedTo = to.replace(/\/$/, "") || "/"

    if (exact && normalizedPath !== normalizedTo) {
      return false
    }

    const [, ...pathRoutes] = normalizedPath.split("/")
    const [, ...toRoutes] = normalizedTo.split("/")
    const isValid = toRoutes.every(
      (route, index) => route === pathRoutes[index],
    )

    return (
      isValid &&
      (search
        ? Object.entries(search ?? {}).every(
            ([key, value]) =>
              currentSearch[key as keyof typeof currentSearch] === value,
          )
        : true)
    )
  }, [path, to, search, currentSearch, exact])

  return (
    <Button
      className={className}
      variant={isActive ? activeVariant : variant}
      size={size}
      asChild
      sx={{ minWidth: "2xl", flexShrink: 0 }}
    >
      <Link
        to={to}
        search={{ ...(ignoreCurrentSearch ? {} : currentSearch), ...search }}
        resetScroll={resetScroll}
      >
        {IconComponent && <Icon size="s" component={IconComponent} />}
        {title}
        {badge && <TabMenuBadge>{badge}</TabMenuBadge>}
      </Link>
    </Button>
  )
}

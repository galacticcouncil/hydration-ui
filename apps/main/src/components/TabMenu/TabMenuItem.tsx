import {
  Button,
  ButtonSize,
  ButtonVariant,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { FC } from "react"

import { TabItem } from "@/components/TabMenu/TabMenu"

export type Props = {
  readonly item: TabItem
  readonly size?: ButtonSize
  readonly variant?: ButtonVariant
  readonly activeVariant?: ButtonVariant
  readonly className?: string
  readonly ignoreCurrentSearch?: boolean
}

export const TabMenuItem: FC<Props> = ({
  item,
  size,
  activeVariant = "secondary",
  variant = "muted",
  className,
  ignoreCurrentSearch,
}) => {
  const { to, title, icon: IconComponent, search, resetScroll } = item

  const path = useLocation({
    select: (state) => state.href,
  })

  const currentSearch = useLocation({
    select: (state) => state.search,
  })

  const isActive = (
    to: string,
    routeSearch?: Record<string, string | boolean>,
  ) => {
    return (
      path.startsWith(to) &&
      (routeSearch
        ? Object.entries(routeSearch ?? {}).every(
            ([key, value]) =>
              currentSearch[key as keyof typeof currentSearch] === value,
          )
        : true)
    )
  }

  return (
    <Button
      className={className}
      variant={isActive(to, search) ? activeVariant : variant}
      size={size}
      asChild
      sx={{ minWidth: "2xl" }}
    >
      <Link
        to={to}
        search={{ ...(ignoreCurrentSearch ? {} : currentSearch), ...search }}
        resetScroll={resetScroll}
      >
        {IconComponent && <IconComponent />}
        {title}
      </Link>
    </Button>
  )
}

import { Button } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { useLocation } from "@tanstack/react-router"
import { FC } from "react"

import { SubpageItem } from "@/components/SubpageMenu/SubpageMenu"

export type Props = {
  readonly item: SubpageItem
}

export const SubpageMenuItem: FC<Props> = ({ item }) => {
  const { to, title, icon: IconComponent, search } = item

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
    <Button variant={isActive(to, search) ? "secondary" : "tertiary"} asChild>
      <Link to={to} search={search}>
        {IconComponent && <IconComponent />}
        {title}
      </Link>
    </Button>
  )
}

import { Button, Flex } from "@galacticcouncil/ui/components"
import { Link, useLocation } from "@tanstack/react-router"
import { FC } from "react"

export type SubpageItem = {
  readonly to: string
  readonly title: string
  readonly icon?: React.ComponentType
  readonly search?: Record<string, string | boolean>
}

type Props = {
  readonly items: ReadonlyArray<SubpageItem>
  readonly className?: string
}

export const SubpageMenu: FC<Props> = ({ items, className }) => {
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
    <Flex gap={20} sx={{ overflowX: "auto" }} className={className}>
      {items.map(({ to, title, icon: IconComponent, search }, index) => (
        <Button
          key={`${to}_${index}`}
          variant={isActive(to, search) ? "secondary" : "tertiary"}
          asChild
        >
          <Link to={to} search={{ ...currentSearch, ...search }}>
            {IconComponent && <IconComponent />}
            {title}
          </Link>
        </Button>
      ))}
    </Flex>
  )
}

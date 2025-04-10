import { Button, Flex } from "@galacticcouncil/ui/components"
import { Link, useLocation } from "@tanstack/react-router"
import { FC } from "react"

export type SubpageItem = {
  readonly to: string
  readonly title: string
  readonly icon?: React.ComponentType
}

type Props = {
  readonly items: ReadonlyArray<SubpageItem>
  readonly className?: string
}

export const SubpageMenu: FC<Props> = ({ items, className }) => {
  const path = useLocation({
    select: (state) => state.href,
  })

  return (
    <Flex gap={20} sx={{ overflowX: "auto" }} className={className}>
      {items.map(({ to, title, icon: IconComponent }) => (
        <Button
          key={to}
          variant={path.startsWith(to) ? "secondary" : "tertiary"}
          asChild
        >
          <Link to={to}>
            {IconComponent && <IconComponent />}
            {title}
          </Link>
        </Button>
      ))}
    </Flex>
  )
}

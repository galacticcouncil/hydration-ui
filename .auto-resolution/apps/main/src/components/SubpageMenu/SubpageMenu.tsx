import { Button, Flex } from "@galacticcouncil/ui/components"
import { Link, useLocation } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

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

  // TODO check if this is correct for liquidity page
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

  const activeKey = items.find(({ to }) => isActive(to))?.to ?? ""

  return (
    <ModalMenuContainer className={className}>
      {items.map(({ to, title, icon }) => (
        <Link to={to} key={to}>
          <ModalMenuItem
            key={to}
            title={title}
            icon={icon}
            isActive={activeKey === to}
          />
        </Link>
      ))}
    </ModalMenuContainer>
  )
}

export type ModalMenuItem<TKey extends string> = {
  readonly key: TKey
  readonly title: string
  readonly icon?: React.ComponentType
}

type ModalMenuProps<TKey extends string> = {
  readonly activeKeys: ReadonlyArray<TKey>
  readonly allItem?: boolean
  readonly items: ReadonlyArray<ModalMenuItem<TKey>>
  readonly className?: string
  readonly onActivate?: (keys: ReadonlyArray<TKey>) => void
}

export const ModalMenu = <TKey extends string>({
  activeKeys,
  allItem,
  items,
  className,
  onActivate,
}: ModalMenuProps<TKey>) => {
  const { t } = useTranslation()

  return (
    <ModalMenuContainer className={className}>
      {allItem && (
        <ModalMenuItem
          title={t("all")}
          isActive={activeKeys.length === items.length}
          onClick={() =>
            onActivate?.(
              activeKeys.length === items.length
                ? []
                : items.map(({ key }) => key),
            )
          }
        />
      )}
      {items.map(({ key, title, icon }) => (
        <ModalMenuItem
          key={key}
          title={title}
          icon={icon}
          isActive={activeKeys.includes(key)}
          onClick={() =>
            onActivate?.(
              activeKeys.includes(key)
                ? activeKeys.filter((k) => k !== key)
                : [...activeKeys, key],
            )
          }
        />
      ))}
    </ModalMenuContainer>
  )
}

const ModalMenuContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <Flex gap={20} sx={{ overflowX: "auto" }} className={className}>
      {children}
    </Flex>
  )
}

type ModalMenuItemProps = {
  readonly isActive: boolean
  readonly title: string
  readonly icon?: React.ComponentType
  readonly onClick?: () => void
}

const ModalMenuItem = ({
  isActive,
  title,
  icon: IconComponent,
  onClick,
}: ModalMenuItemProps) => {
  return (
    <Button variant={isActive ? "secondary" : "tertiary"} onClick={onClick}>
      {IconComponent && <IconComponent />}
      {title}
    </Button>
  )
}

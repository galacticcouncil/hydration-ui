import { IconPlaceholder } from "@galacticcouncil/ui/assets/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@galacticcouncil/ui/components"
import { useMatchRoute } from "@tanstack/react-router"

import { DetailedLink } from "@/components/DetailedLink"
import { LINKS } from "@/config/navigation"
import {
  HIDDEN_DESKTOP_NAV_ROUTES,
  useMenuTranslations,
} from "@/modules/layout/components/HeaderMenu.utils"
import {
  isExternalNavItem,
  NavigationItemLabel,
  NavigationItemLink,
} from "@/modules/layout/components/NavigationItemLink"
import { StrategiesHeaderSubmenu } from "@/modules/layout/components/StrategiesHeaderSubmenu"
import { useNavigation } from "@/modules/layout/hooks/useNavigation"

export const HeaderMenu: React.FC<
  React.ComponentProps<typeof NavigationMenu>
> = (props) => {
  const translations = useMenuTranslations()
  const navigation = useNavigation()
  const matchRoute = useMatchRoute()
  const isHiddenDesktopNavRoute = HIDDEN_DESKTOP_NAV_ROUTES.some(
    (route) => !!matchRoute({ to: route }),
  )

  if (isHiddenDesktopNavRoute) {
    return <div />
  }

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        {navigation.map((item) => {
          const { key, children, to } = item
          const external = isExternalNavItem(item)

          const isLiquidityPage = to === LINKS.liquidity
          const isStrategiesPage = to === LINKS.strategies

          return (
            <NavigationMenuItem key={key} data-intersect={key}>
              <NavigationMenuTrigger asChild>
                <NavigationItemLink item={item}>
                  <NavigationItemLabel
                    title={translations[key].title}
                    external={external}
                  />
                </NavigationItemLink>
              </NavigationMenuTrigger>
              {children &&
                children.length > 1 &&
                (isLiquidityPage ? null : (
                  <NavigationMenuContent>
                    {isStrategiesPage ? (
                      <StrategiesHeaderSubmenu items={children} />
                    ) : (
                      children.map(({ to, search, key, icon }) => (
                        <DetailedLink
                          key={key}
                          to={to}
                          search={search}
                          title={translations[key].title}
                          description={translations[key].description}
                          icon={icon ?? IconPlaceholder}
                        />
                      ))
                    )}
                  </NavigationMenuContent>
                ))}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

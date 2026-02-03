import { IconPlaceholder } from "@galacticcouncil/ui/assets/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"

import { DetailedLink } from "@/components/DetailedLink"
import { LINKS, NAVIGATION, NavigationItem } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"
import { useIsLiquidityProvided } from "@/modules/liquidity/Liquidity.utils"

export const HeaderMenu: React.FC<
  React.ComponentProps<typeof NavigationMenu>
> = (props) => {
  const translations = useMenuTranslations()

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        {NAVIGATION.map(({ key, children, to, search, defaultChild }) => {
          const linkTo = defaultChild ?? to

          const isLiquidityPage = to === LINKS.liquidity

          return (
            <NavigationMenuItem key={key} data-intersect={key}>
              <NavigationMenuTrigger asChild>
                <Link to={linkTo} search={search}>
                  {translations[key].title}
                </Link>
              </NavigationMenuTrigger>
              {children &&
                children.length > 1 &&
                (isLiquidityPage ? (
                  <LiquidityMenuContent items={children} />
                ) : (
                  <NavigationMenuContent>
                    {children.map(({ to, search, key, icon }) => (
                      <DetailedLink
                        key={key}
                        to={to}
                        search={search}
                        title={translations[key].title}
                        description={translations[key].description}
                        icon={icon ?? IconPlaceholder}
                      />
                    ))}
                  </NavigationMenuContent>
                ))}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

const LiquidityMenuContent = ({ items }: { items: NavigationItem[] }) => {
  const translations = useMenuTranslations()
  const isLiquidityProvided = useIsLiquidityProvided()

  if (!isLiquidityProvided) {
    return null
  }

  return (
    <NavigationMenuContent>
      {items.map(({ to, search, key, icon }) => (
        <DetailedLink
          key={key}
          to={to}
          search={search}
          title={translations[key].title}
          description={translations[key].description}
          icon={icon ?? IconPlaceholder}
        />
      ))}
    </NavigationMenuContent>
  )
}

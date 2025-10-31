import { Circle } from "@galacticcouncil/ui/assets/icons"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"

import { DetailedLink } from "@/components/DetailedLink"
import { NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

export const HeaderMenu: React.FC<
  React.ComponentProps<typeof NavigationMenu>
> = (props) => {
  const translations = useMenuTranslations()

  return (
    <NavigationMenu {...props}>
      <NavigationMenuList>
        {NAVIGATION.map(({ key, children, to, search }) => (
          <NavigationMenuItem key={key} data-intersect={key}>
            <NavigationMenuTrigger asChild>
              <Link to={to} search={search}>
                {translations[key].title}
              </Link>
            </NavigationMenuTrigger>
            {children && children.length > 1 && (
              <NavigationMenuContent>
                {children.map(({ to, search, key, icon }) => (
                  <DetailedLink
                    key={key}
                    to={to}
                    search={search}
                    title={translations[key].title}
                    description={translations[key].description}
                    icon={icon ?? Circle}
                  />
                ))}
              </NavigationMenuContent>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

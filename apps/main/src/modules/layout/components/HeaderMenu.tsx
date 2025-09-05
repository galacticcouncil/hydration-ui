import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  FlexProps,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { DetailedLink } from "@/components/DetailedLink"
import {
  SHeaderMenu,
  SHeaderMenuItem,
  SHeaderMoreMenuItem,
} from "@/modules/layout/components/HeaderMenu.styled"
import {
  useMenuTranslations,
  useVisibleHeaderMenuItems,
} from "@/modules/layout/components/HeaderMenu.utils"

export const HeaderMenu: React.FC<FlexProps> = (props) => {
  const { t } = useTranslation()
  const translations = useMenuTranslations()

  const { items, visibleItemKeys, hiddenItems, observe, moreButtonKey } =
    useVisibleHeaderMenuItems()

  return (
    <SHeaderMenu ref={observe} {...props}>
      {items.map(({ key, to, children, search }) => {
        const isMoreButton = key === moreButtonKey
        const subItems = isMoreButton
          ? hiddenItems
          : children && children.length > 1
            ? children
            : null

        return (
          <HoverCard key={key}>
            <HoverCardTrigger
              sx={{ position: "relative" }}
              data-intersect={key}
              asChild
            >
              <div>
                <SHeaderMenuItem
                  isHidden={isMoreButton || !visibleItemKeys.includes(key)}
                  asChild
                >
                  <Link to={to} search={search}>
                    {translations[key].title}
                  </Link>
                </SHeaderMenuItem>
                {isMoreButton && (
                  <SHeaderMoreMenuItem>
                    {t("more")}
                    <ChevronDown />
                  </SHeaderMoreMenuItem>
                )}
              </div>
            </HoverCardTrigger>
            {subItems && (
              <HoverCardContent
                borderRadius="xxl"
                sideOffset={10}
                alignOffset={-40}
              >
                {subItems.map(({ key, to, icon, search }) => (
                  <DetailedLink
                    key={key}
                    to={to}
                    search={search}
                    title={translations[key].title}
                    description={translations[key].description}
                    icon={icon}
                  />
                ))}
              </HoverCardContent>
            )}
          </HoverCard>
        )
      })}
    </SHeaderMenu>
  )
}

import { BookOpenIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline"
import { ReactNode } from "react"
import { ROUTES } from "sections/lending/components/primitives/Link"

import { MarketDataType } from "sections/lending/ui-config/marketsConfig"

interface Navigation {
  link: string
  title: string
  isVisible?: (data: MarketDataType) => boolean | undefined
  dataCy?: string
}

export const navigation: Navigation[] = [
  {
    link: ROUTES.dashboard,
    title: `Dashboard`,
    dataCy: "menuDashboard",
  },
  {
    link: ROUTES.markets,
    title: `Markets`,
    dataCy: "menuMarkets",
  },
]

interface MoreMenuItem extends Navigation {
  icon: ReactNode
  makeLink?: (walletAddress: string) => string
}

const moreMenuItems: MoreMenuItem[] = [
  {
    link: "https://docs.aave.com/faq/",
    title: `FAQ`,
    icon: <QuestionMarkCircleIcon />,
  },
  {
    link: "https://docs.aave.com/portal/",
    title: `Developers`,
    icon: <BookOpenIcon />,
  },
]

export const moreNavigation: MoreMenuItem[] = [...moreMenuItems]

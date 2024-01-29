import { BookOpenIcon, QuestionMarkCircleIcon } from "@heroicons/react/outline"
import { ReactNode } from "react"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { ENABLE_TESTNET } from "sections/lending/utils/marketsAndNetworksConfig"

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
  /* {
    link: ROUTES.staking,
    title: `Stake`,
    dataCy: "menuStake",
    isVisible: () =>
      import.meta.env.VITE_ENV === "production" && !ENABLE_TESTNET,
  }, */
  /*  {
    link: ROUTES.governance,
    title: `Governance`,
    dataCy: "menuGovernance",
    // isVisible: () =>
    //   process.env.NEXT_PUBLIC_ENABLE_GOVERNANCE === 'true' &&
    //   process.env.NEXT_PUBLIC_ENV === 'prod' &&
    //   !ENABLE_TESTNET,
  }, */
  {
    link: ROUTES.faucet,
    title: `Fauce`,
    isVisible: () => import.meta.env.VITE_ENV === "rococo" || ENABLE_TESTNET,
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

/* const fiatEnabled = "true"
if (fiatEnabled === "true") {
  moreMenuItems.push({
    link: "https://global.transak.com",
    makeLink: (walletAddress) =>
      `${process.env.NEXT_PUBLIC_TRANSAK_APP_URL}/?apiKey=${process.env.NEXT_PUBLIC_TRANSAK_API_KEY}&walletAddress=${walletAddress}&disableWalletAddressForm=true`,
    title: `Buy Crypto With Fia`,
    icon: <CreditCardIcon />,
  })
} */
export const moreNavigation: MoreMenuItem[] = [...moreMenuItems]

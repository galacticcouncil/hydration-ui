import ChartIcon from "assets/icons/ChartIcon.svg?react"
// TODO: Not ready. Requested in #861n9ffe4
// import LRNAIcon from "assets/icons/LRNAIcon.svg?react"
import WalletIcon from "assets/icons/WalletIcon.svg?react"
import { LINKS } from "utils/navigation"

export const STATS_TABS = [
  { id: "overview", link: LINKS.statsOverview, icon: <ChartIcon /> },
  { id: "POL", link: LINKS.statsPOL, icon: <WalletIcon /> },
  // TODO: Not ready. Requested in #861n9ffe4
  // { id: "LRNA", link: LINKS.statsLRNA, icon: <LRNAIcon /> },
] as const

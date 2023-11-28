import ChartIcon from "assets/icons/ChartIcon.svg?react"
// TODO: Not ready. Requested in #861n9ffe4
// import LRNAIcon from "assets/icons/LRNAIcon.svg?react"
import TreasuryIcon from "assets/icons/Treasury.svg?react"
import { LINKS } from "utils/navigation"

export const STATS_TABS = [
  { id: "overview", link: LINKS.statsOverview, icon: <ChartIcon /> },
  { id: "POL", link: LINKS.statsPOL, icon: <TreasuryIcon /> },
  // TODO: Not ready. Requested in #861n9ffe4
  // { id: "LRNA", link: LINKS.statsLRNA, icon: <LRNAIcon /> },
] as const

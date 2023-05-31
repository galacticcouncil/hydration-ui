import { ReactComponent as ChartIcon } from "assets/icons/ChartIcon.svg"
import { ReactComponent as LRNAIcon } from "assets/icons/LRNAIcon.svg"
import { ReactComponent as WalletIcon } from "assets/icons/WalletIcon.svg"
import { LINKS } from "utils/navigation"

export const STATS_TABS = [
  { id: "overview", link: LINKS.statsOverview, icon: <ChartIcon /> },
  { id: "POL", link: LINKS.statsPOL, icon: <WalletIcon /> },
  { id: "LRNA", link: LINKS.statsLRNA, icon: <LRNAIcon /> },
] as const

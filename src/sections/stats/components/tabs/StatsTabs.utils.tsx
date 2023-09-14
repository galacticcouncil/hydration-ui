import { ReactComponent as ChartIcon } from "assets/icons/ChartIcon.svg"
// TODO: Not ready. Requested in #861n9ffe4
// import { ReactComponent as LRNAIcon } from "assets/icons/LRNAIcon.svg"
import { ReactComponent as WalletIcon } from "assets/icons/WalletIcon.svg"
import { LINKS } from "utils/navigation"

export const STATS_TABS = [
  { id: "overview", link: LINKS.statsOverview, icon: <ChartIcon /> },
  { id: "POL", link: LINKS.statsPOL, icon: <WalletIcon /> },
  // TODO: Not ready. Requested in #861n9ffe4
  // { id: "LRNA", link: LINKS.statsLRNA, icon: <LRNAIcon /> },
] as const

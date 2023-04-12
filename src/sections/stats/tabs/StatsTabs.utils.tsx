import { ReactComponent as IconLRNA } from "assets/icons/stats/IconLRNA.svg"
import { ReactComponent as IconOverview } from "assets/icons/stats/IconOverview.svg"
import { ReactComponent as IconPOL } from "assets/icons/stats/IconPOL.svg"
import { LINKS } from "utils/navigation"

export const STATS_TABS = [
  { id: "overview", link: LINKS.statsOverview, icon: <IconOverview /> },
  { id: "POL", link: LINKS.statsPOL, icon: <IconPOL /> },
  { id: "LRNA", link: LINKS.statsLRNA, icon: <IconLRNA /> },
] as const

import { TabItem } from "@/components/TabMenu"
import i18n from "@/i18n"

export const walletAssetFiltersItems = [
  {
    to: "/wallet/assets",
    search: { category: "all" },
    title: i18n.t("wallet:myAssets.redesign.tabs.overview"),
    resetScroll: false,
  },
  {
    to: "/wallet/assets",
    search: { category: "tracked" },
    title: i18n.t("wallet:myAssets.redesign.tracked.title"),
    resetScroll: false,
  },
] as const satisfies Array<TabItem>

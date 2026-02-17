import { TabItem } from "@/components/TabMenu"
import i18n from "@/i18n"

export const walletAssetFiltersItems = [
  {
    to: "/wallet/assets",
    search: { category: "all" },
    title: i18n.t("all"),
    resetScroll: false,
  },
  {
    to: "/wallet/assets",
    search: { category: "assets" },
    title: i18n.t("assets"),
    resetScroll: false,
  },
  {
    to: "/wallet/assets",
    search: { category: "liquidity" },
    title: i18n.t("liquidity"),
    resetScroll: false,
  },
] as const satisfies Array<TabItem>

import i18next from "i18next"

import { TabItem } from "@/components/TabMenu"

export const walletAssetFiltersItems = [
  {
    to: "/wallet/assets",
    search: { category: "all" },
    title: i18next.t("all"),
    resetScroll: false,
  },
  {
    to: "/wallet/assets",
    search: { category: "assets" },
    title: i18next.t("assets"),
    resetScroll: false,
  },
  {
    to: "/wallet/assets",
    search: { category: "liquidity" },
    title: i18next.t("liquidity"),
    resetScroll: false,
  },
] as const satisfies Array<TabItem>

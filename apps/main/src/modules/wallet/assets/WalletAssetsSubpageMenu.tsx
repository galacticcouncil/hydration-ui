import { useTranslation } from "react-i18next"

import { TabMenu } from "@/components/TabMenu/TabMenu"

export const WalletAssetsSubpageMenu = () => {
  const { t } = useTranslation()

  return (
    <TabMenu
      items={[
        {
          to: "/wallet/assets",
          search: { category: "all" },
          title: t("all"),
          resetScroll: false,
        },
        {
          to: "/wallet/assets",
          search: { category: "assets" },
          title: t("assets"),
          resetScroll: false,
        },
        {
          to: "/wallet/assets",
          search: { category: "liquidity" },
          title: t("liquidity"),
          resetScroll: false,
        },
      ]}
    />
  )
}

import { useTranslation } from "react-i18next"

import { SubpageMenu } from "@/components/SubpageMenu"
import { LINKS } from "@/config/navigation"
export const PoolTypeTabs = () => {
  const { t } = useTranslation("liquidity")

  return (
    <SubpageMenu
      items={[
        {
          to: LINKS.liquidity,
          search: { type: "all" },
          title: t("tab.allPools"),
        },
        {
          to: LINKS.liquidity,
          search: { type: "omnipoolStablepool" },
          title: t("tab.omnipoolStablepool"),
        },
        {
          to: LINKS.liquidity,
          search: { type: "isolated" },
          title: t("tab.isolatedPools"),
        },
      ]}
    />
  )
}

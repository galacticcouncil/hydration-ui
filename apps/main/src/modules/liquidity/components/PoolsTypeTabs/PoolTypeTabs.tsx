import { useRouter } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { SubpageMenu } from "@/components/SubpageMenu"

export const PoolTypeTabs = () => {
  const { t } = useTranslation("liquidity")

  const router = useRouter()

  return (
    <SubpageMenu
      items={[
        {
          to: `${router.state.location.pathname}?type=all`,
          title: t("tab.allPools"),
        },
        {
          to: `${router.state.location.pathname}?type=omnipoolStablepool`,
          title: t("tab.omnipoolStablepool"),
        },
        {
          to: `${router.state.location.pathname}?type=isolated`,
          title: t("tab.isolatedPools"),
        },
      ]}
    />
  )
}

import { Select } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useTranslation } from "react-i18next"

import { TabMenu } from "@/components/TabMenu"
import { LINKS } from "@/config/navigation"

export const PoolTypeTabs = () => {
  const { t } = useTranslation("liquidity")
  const { isMobile } = useBreakpoints()
  const navigate = useNavigate()
  const search = useSearch({
    from: "/liquidity/",
  })

  if (isMobile) {
    return (
      <Select
        value={search?.type}
        items={[
          {
            key: "all",
            label: t("tab.allPools"),
          },
          {
            key: "omnipoolStablepool",
            label: t("tab.omnipoolStablepool"),
          },
          {
            key: "isolated",
            label: t("tab.isolatedPools"),
          },
        ]}
        onValueChange={(value) =>
          navigate({
            to: LINKS.liquidity,
            search: {
              myLiquidity: search?.myLiquidity,
              type: value as "all" | "omnipoolStablepool" | "isolated",
            },
          })
        }
      />
    )
  }

  return (
    <TabMenu
      size="medium"
      variant="muted"
      items={[
        {
          to: LINKS.liquidity,
          search: { type: "all", myLiquidity: search?.myLiquidity },
          title: t("tab.allPools"),
        },
        {
          to: LINKS.liquidity,
          search: {
            type: "omnipoolStablepool",
            myLiquidity: search?.myLiquidity,
          },
          title: t("tab.omnipoolStablepool"),
        },
        {
          to: LINKS.liquidity,
          search: {
            type: "isolated",
            myLiquidity: search?.myLiquidity,
          },
          title: t("tab.isolatedPools"),
        },
      ]}
    />
  )
}

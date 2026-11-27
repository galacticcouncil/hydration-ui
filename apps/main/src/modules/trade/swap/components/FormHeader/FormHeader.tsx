import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { Link, useMatchRoute, useSearch } from "@tanstack/react-router"
import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { NAVIGATION, swapTabLink, SwapTabParam } from "@/config/navigation"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import {
  normalizeSearchForOnChainSwapTab,
  TradeHistorySearchParams,
} from "@/routes/trade/_history/route"

import { SFormHeader, SHeaderTab } from "./FormHeader.styled"

const swapRouteItems =
  NAVIGATION.find((item) => item.key === "trade")?.children?.find(
    (item) => item.key === "swap",
  )?.children ?? []

const ON_CHAIN_SWAP_TABS = new Set<SwapTabParam>(["limit", "twap"])

const searchForSwapTab = (
  search: TradeHistorySearchParams,
  tab: SwapTabParam | undefined,
) =>
  tab && ON_CHAIN_SWAP_TABS.has(tab)
    ? normalizeSearchForOnChainSwapTab(search)
    : search

export const FormHeader = () => {
  const { t } = useTranslation(["trade", "common"])
  const [openSettings, setOpenSettings] = useState(false)

  const search = useSearch({ from: "/trade/_history/swap" })
  const matchRoute = useMatchRoute()
  // The Limit tab has no trade settings
  const hasSettings =
    !!matchRoute(swapTabLink("market")) || !!matchRoute(swapTabLink("twap"))

  // Going back to Limit unmounts an open modal without closing it
  useEffect(() => {
    if (!hasSettings) setOpenSettings(false)
  }, [hasSettings])

  return (
    <SFormHeader justify="space-between" align="center">
      <Flex>
        {swapRouteItems.map((routeItem) => (
          <SHeaderTab key={routeItem.key} asChild>
            <Link
              to={routeItem.to}
              params={routeItem.params}
              search={searchForSwapTab(
                search,
                routeItem.params?.tab as SwapTabParam | undefined,
              )}
              resetScroll={false}
            >
              {t(`common:navigation.${routeItem.key}.title`)}
            </Link>
          </SHeaderTab>
        ))}
      </Flex>

      {hasSettings && (
        <>
          <Button
            icon={Settings}
            variant="ghost"
            onClick={() => setOpenSettings(true)}
            aria-label={t("common:settings")}
            mr="-s"
          />

          <Modal
            variant="popup"
            open={openSettings}
            onOpenChange={setOpenSettings}
          >
            <SettingsModal />
          </Modal>
        </>
      )}
    </SFormHeader>
  )
}

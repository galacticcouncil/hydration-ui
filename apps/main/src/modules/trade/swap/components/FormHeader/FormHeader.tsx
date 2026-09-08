import { ButtonIcon, Flex, Icon, Modal } from "@galacticcouncil/ui/components"
import { Link, useMatchRoute, useSearch } from "@tanstack/react-router"
import { Settings } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { NAVIGATION, swapTabLink } from "@/config/navigation"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { useIsIceEnabled } from "@/states/intents"
import { TutorialAnchor } from "@/tutorials/TutorialAnchor"

import { SFormHeader, SHeaderTab } from "./FormHeader.styled"

const swapRouteItems =
  NAVIGATION.find((item) => item.key === "trade")?.children?.find(
    (item) => item.key === "swap",
  )?.children ?? []

export const FormHeader = () => {
  const { t } = useTranslation(["trade", "common"])
  const [openSettings, setOpenSettings] = useState(false)
  const isIceEnabled = useIsIceEnabled()

  const search = useSearch({ from: "/trade/_history/swap" })
  const matchRoute = useMatchRoute()
  const hasSettings =
    !!matchRoute(swapTabLink("market")) || !!matchRoute(swapTabLink("twap"))

  return (
    <SFormHeader justify="space-between" align="center">
      <Flex>
        {swapRouteItems
          .filter((routeItem) => isIceEnabled || routeItem.key !== "swapLimit")
          .map((routeItem) => (
            <SHeaderTab key={routeItem.key} asChild>
              <Link
                to={routeItem.to}
                params={routeItem.params}
                search={search}
                resetScroll={false}
              >
                {t(`common:navigation.${routeItem.key}.title`)}
              </Link>
            </SHeaderTab>
          ))}
      </Flex>

      {hasSettings && (
        <>
          <TutorialAnchor tutorial="trade-intents" step={0} asChild>
            <ButtonIcon
              onClick={() => setOpenSettings(true)}
              aria-label={t("common:settings")}
              mr="-s"
            >
              <Icon size="s" component={Settings} />
            </ButtonIcon>
          </TutorialAnchor>

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

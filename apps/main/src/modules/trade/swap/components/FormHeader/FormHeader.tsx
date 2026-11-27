import { Button, Flex, Modal } from "@galacticcouncil/ui/components"
import { Link, useSearch } from "@tanstack/react-router"
import { Settings } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { NAVIGATION } from "@/config/navigation"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { normalizeSearchForSwapTab } from "@/modules/trade/swap/lib/swapTabSearch"
import { TutorialAnchor } from "@/modules/tutorials/TutorialAnchor"
import { useIsIceEnabled } from "@/states/intents"

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
                search={normalizeSearchForSwapTab(
                  routeItem.params?.tab,
                  search,
                )}
                resetScroll={false}
              >
                {t(`common:navigation.${routeItem.key}.title`)}
              </Link>
            </SHeaderTab>
          ))}
      </Flex>

      <TutorialAnchor tutorial="trade-intents" step={0} asChild>
        <Button
          icon={Settings}
          variant="ghost"
          onClick={() => setOpenSettings(true)}
          aria-label={t("common:settings")}
          mr="-s"
        />
      </TutorialAnchor>

      <Modal variant="popup" open={openSettings} onOpenChange={setOpenSettings}>
        <SettingsModal />
      </Modal>
    </SFormHeader>
  )
}

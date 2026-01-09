import { Flex, Modal } from "@galacticcouncil/ui/components"
import { Link, useMatchRoute, useSearch } from "@tanstack/react-router"
import { Settings } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { LINKS, NAVIGATION } from "@/config/navigation"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"

import { SFormHeader, SHeaderTab, SSettingsIcon } from "./FormHeader.styled"

const swapRouteItems =
  NAVIGATION.find((item) => item.key === "trade")?.children?.find(
    (item) => item.key === "swap",
  )?.children ?? []

export const FormHeader = () => {
  const { t } = useTranslation(["trade", "common"])
  const [openSettings, setOpenSettings] = useState(false)

  const search = useSearch({ from: "/trade/_history/swap" })
  const matchRoute = useMatchRoute()
  const hasSettings =
    !!matchRoute({ to: LINKS.swapMarket }) ||
    !!matchRoute({ to: LINKS.swapDca })

  return (
    <SFormHeader justify="space-between" align="center">
      <Flex>
        {swapRouteItems.map((routeItem) => (
          <SHeaderTab key={routeItem.key} asChild>
            <Link to={routeItem.to} search={search}>
              {t(`common:navigation.${routeItem.key}.title`)}
            </Link>
          </SHeaderTab>
        ))}
      </Flex>

      {hasSettings && (
        <>
          <SSettingsIcon
            m={8}
            as="button"
            aria-label="Settings"
            size={18}
            component={Settings}
            onClick={() => setOpenSettings(true)}
          />

          <Modal open={openSettings} onOpenChange={setOpenSettings}>
            <SettingsModal />
          </Modal>
        </>
      )}
    </SFormHeader>
  )
}

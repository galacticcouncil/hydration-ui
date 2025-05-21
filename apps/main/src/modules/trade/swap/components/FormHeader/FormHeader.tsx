import { Flex, Modal } from "@galacticcouncil/ui/components"
import { Link, useSearch } from "@tanstack/react-router"
import { Settings } from "lucide-react"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { FileRouteTypes } from "@/routeTree.gen"

import { SFormHeader, SHeaderTab, SSettingsIcon } from "./FormHeader.styled"

type GetTradeSwapTab<T> = T extends `/trade/swap/${infer Tab}` ? Tab : never
type ToRoute = FileRouteTypes["to"]
type TradeSwapTab = GetTradeSwapTab<ToRoute>

export const swapTabs: ReadonlyArray<TradeSwapTab> = [
  "market",
  "dca",
  "cross-chain",
] as const

export const FormHeader = () => {
  const { t } = useTranslation("trade")
  const [openSettings, setOpenSettings] = useState(false)

  const search = useSearch({ from: "/trade/_history/swap" })

  return (
    <SFormHeader justify="space-between" align="center">
      <Flex>
        {swapTabs.map((tab) => (
          <SHeaderTab key={tab} asChild>
            <Link to={`/trade/swap/${tab}`} search={search}>
              {t(`swap.header.${tab}`)}
            </Link>
          </SHeaderTab>
        ))}
      </Flex>

      <SSettingsIcon
        as="button"
        aria-label="Settings"
        size={20}
        component={Settings}
        onClick={() => setOpenSettings(true)}
      />

      <Modal open={openSettings} onOpenChange={setOpenSettings}>
        <SettingsModal />
      </Modal>
    </SFormHeader>
  )
}

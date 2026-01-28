import { Swap } from "@galacticcouncil/sdk-next/build/types/sor"
import { Routes } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, MicroButton, Modal } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TradeType } from "@/api/trade"
import { mapRoutes } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes.utils"
import { TradeRoutesModalContent } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutesModalContent"
import { useAssets } from "@/providers/assetsProvider"

type TradeRoutesProps = {
  readonly swapType: TradeType
  readonly totalFeesDisplay: string
  readonly routes: ReadonlyArray<Swap>
}

export const TradeRoutes = ({
  swapType,
  totalFeesDisplay,
  routes,
}: TradeRoutesProps) => {
  const { t } = useTranslation(["trade", "common"])
  const { getAssetWithFallback } = useAssets()

  const [isModalOpen, setIsModalOpen] = useState(false)

  const mappedRoutes = mapRoutes(swapType, routes, getAssetWithFallback)

  return (
    <>
      <Flex align="center" gap="s">
        <Flex gap="xs" align="center">
          {t("market.summary.routes.count", { count: mappedRoutes.length })}
          <Icon
            height={24}
            width={14}
            component={Routes}
            color={getToken("buttons.primary.high.rest")}
          />
        </Flex>
        <MicroButton onClick={() => setIsModalOpen(true)}>
          {t("common:preview")}
        </MicroButton>
      </Flex>
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <TradeRoutesModalContent
          totalFeesDisplay={totalFeesDisplay}
          routes={mappedRoutes}
        />
      </Modal>
    </>
  )
}

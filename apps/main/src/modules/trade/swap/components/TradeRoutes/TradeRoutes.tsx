import { Swap } from "@galacticcouncil/sdk-next/build/types/sor"
import { Routes } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, MicroButton, Modal } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { GDOT_ASSET_ID } from "@galacticcouncil/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { TradeType } from "@/api/trade"
import { TradeRoutesModalContent } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutesModalContent"

type TradeRoutesProps = {
  readonly swapType: TradeType
  readonly routes: ReadonlyArray<Swap>
}

export const TradeRoutes = ({ swapType, routes }: TradeRoutesProps) => {
  const { t } = useTranslation(["trade", "common"])

  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredRoutes = // Hide 2-Pool-GDOT
    routes.filter((route) => route.assetOut !== Number(GDOT_ASSET_ID))

  return (
    <>
      <Flex align="center" gap={4}>
        <Flex gap={1} align="center">
          {t("market.summary.routes.count", { count: filteredRoutes.length })}
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
        <TradeRoutesModalContent swapType={swapType} routes={filteredRoutes} />
      </Modal>
    </>
  )
}

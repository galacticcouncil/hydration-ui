import { Alert, Flex, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"

export const MarketWarnings: FC = () => {
  const { t } = useTranslation("trade")
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const { watch } = useFormContext<MarketFormValues>()
  const sellAsset = watch("sellAsset")

  return (
    <Flex direction="column" gap={6} mt={10}>
      {sellAsset?.type === AssetType.ERC20 && (
        <Alert variant="warning" description={t("market.warn.aToken")} />
      )}
      <Modal open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <SettingsModal />
      </Modal>
    </Flex>
  )
}

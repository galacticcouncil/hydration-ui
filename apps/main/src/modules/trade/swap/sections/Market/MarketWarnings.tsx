import { Alert, Flex, Modal, TextButton } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { SelectedTradeOption } from "@/modules/trade/swap/sections/Market/Market"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly selectedTradeOption: SelectedTradeOption | null
}

export const MarketWarnings: FC<Props> = ({ selectedTradeOption }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useTranslation("trade")
  const { watch } = useFormContext<MarketFormValues>()
  const {
    split: { twapSlippage },
  } = useTradeSettings()
  const sellAsset = watch("sellAsset")

  return (
    <Flex direction="column" gap={6} mt={10}>
      {selectedTradeOption?.type === "twap" &&
        Math.abs(selectedTradeOption.twap.priceImpactPct) < 5 &&
        Number(twapSlippage) <
          Math.abs(selectedTradeOption.twap.priceImpactPct) && (
          <Alert
            variant="warning"
            description={t("market.warn.changeSlippage")}
            action={
              <TextButton
                variant="underline"
                onClick={() => setIsSettingsOpen(true)}
              >
                {t("market.warn.changeSlippage.cta")}
              </TextButton>
            }
          />
        )}
      {selectedTradeOption?.type === "twap" &&
        Math.abs(selectedTradeOption.swap.priceImpactPct) > 5 && (
          <Alert
            variant="warning"
            description={t("market.warn.useDca")}
            action={
              <Link to="/trade/swap/dca">
                <TextButton variant="underline">
                  {t("market.warn.useDca.cta")}
                </TextButton>
              </Link>
            }
          />
        )}
      {sellAsset?.type === AssetType.ERC20 && (
        <Alert variant="warning" description={t("market.warn.aToken")} />
      )}
      <Modal
        open={isSettingsOpen}
        onOpenChange={() => setIsSettingsOpen(false)}
      >
        <SettingsModal />
      </Modal>
    </Flex>
  )
}

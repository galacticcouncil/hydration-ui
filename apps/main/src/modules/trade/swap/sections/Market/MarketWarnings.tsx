import { TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Alert, Flex, Modal, TextButton } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly isSingleTrade: boolean
  readonly twap: TradeOrder | undefined
}

export const MarketWarnings: FC<Props> = ({ isSingleTrade, twap }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useTranslation("trade")
  const { watch } = useFormContext<MarketFormValues>()
  const sellAsset = watch("sellAsset")

  const {
    swap: {
      split: { twapSlippage },
    },
  } = useTradeSettings()

  return (
    <Flex direction="column" gap={6} mt={10}>
      {!isSingleTrade && twap && (
        <>
          {Math.abs(twap.tradeImpactPct) < 5 &&
            Number(twapSlippage) < Math.abs(twap.tradeImpactPct) && (
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
          {Math.abs(twap.tradeImpactPct) > 5 && (
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
        </>
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

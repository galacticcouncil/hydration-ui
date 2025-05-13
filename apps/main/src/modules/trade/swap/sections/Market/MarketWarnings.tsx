import { Alert, Flex, TextButton } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetType } from "@/api/assets"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { SelectedTradeOption } from "@/modules/trade/swap/sections/Market/Market"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/useMarketForm"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly selectedTradeOption: SelectedTradeOption | null
}

export const MarketWarnings: FC<Props> = ({ selectedTradeOption }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useTranslation("trade")
  const { watch } = useFormContext<MarketFormValues>()
  const { slippageTwap } = useTradeSettings()
  const sellAsset = watch("sellAsset")

  return (
    <Flex direction="column" gap={6} mt={10}>
      {selectedTradeOption?.type === "twap" &&
        Math.abs(selectedTradeOption.twap.priceImpactPct) < 5 &&
        Number(slippageTwap) <
          Math.abs(selectedTradeOption.twap.priceImpactPct) && (
          <Alert
            variant="warning"
            description={t("market.warn.changeSlippage")}
            action={
              <TextButton
                variant="underline"
                onClick={() => setIsSettingsOpen(true)}
              >
                Adjust slippage
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
                <TextButton variant="underline">Go to DCA</TextButton>
              </Link>
            }
          />
        )}
      {sellAsset?.type === AssetType.ERC20 && (
        <Alert variant="warning" description={t("market.warn.aToken")} />
      )}
      {isSettingsOpen && <SettingsModal onOpenChange={setIsSettingsOpen} />}
    </Flex>
  )
}

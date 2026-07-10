import { TriangleAlert } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  MicroButton,
  Modal,
  SummaryRowValue,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { getMaxSlippageThreshold } from "@/modules/trade/swap/sections/Market/MarketWarnings"

type Props = {
  readonly tradeLimit: number
  readonly priceImpact: number
}

const WARING_TRADE_LIMIT = 3

export const TradeLimitSummaryRow: FC<Props> = ({
  tradeLimit,
  priceImpact,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const [openSettings, setOpenSettings] = useState(false)

  const absPriceImpact = Math.abs(priceImpact)
  const threshold = getMaxSlippageThreshold(absPriceImpact)
  const validSlippage = Big(absPriceImpact).plus(threshold).toNumber()
  //
  const isWarning =
    tradeLimit > WARING_TRADE_LIMIT && tradeLimit > validSlippage

  return (
    <>
      <SwapSummaryRow
        label={t("trade:dca.summary.slippage")}
        content={
          <SummaryRowValue
            color={
              isWarning
                ? getToken("accents.alertAlt.primary")
                : getToken("text.tint.quart")
            }
          >
            <Flex align="center" gap="xs">
              {t("percent", { value: tradeLimit })}

              {isWarning && (
                <Tooltip
                  text={t("trade:market.summary.tradeLimit.tooltip")}
                  iconColor={getToken("accents.alertAlt.primary")}
                  asChild
                >
                  <Icon
                    size={14}
                    component={TriangleAlert}
                    color={getToken("accents.alertAlt.primary")}
                  />
                </Tooltip>
              )}
              <MicroButton
                variant="emphasis"
                onClick={() => setOpenSettings(true)}
              >
                {t("edit")}
              </MicroButton>
            </Flex>
          </SummaryRowValue>
        }
      />
      <Modal variant="popup" open={openSettings} onOpenChange={setOpenSettings}>
        <SettingsModal />
      </Modal>
    </>
  )
}

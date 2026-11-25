import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/sor"
import { Pencil } from "@galacticcouncil/ui/assets/icons"
import { Alert, Flex, TextButton } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { CallType } from "@galacticcouncil/xc-core"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { HealthFactorRiskWarning } from "@/modules/money-market/health-factor/HealthFactorRiskWarning"
import { getMaxSlippageThreshold } from "@/modules/trade/swap/sections/XcSwap/lib/slippageThreshold"
import { useIsIceEnabled } from "@/states/intents"
import { useToasts } from "@/states/toasts"
import { useTradeSettings } from "@/states/tradeSettings"
import { TransactionType } from "@/states/transactions"

type Props = {
  readonly isFormValid: boolean
  readonly isSingleTrade: boolean
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly setHealthFactorRiskAccepted: (accepted: boolean) => void
}

export const TradeWarnings: FC<Props> = ({
  isFormValid,
  isSingleTrade,
  swap,
  twap,
  healthFactor,
  healthFactorRiskAccepted,
  setHealthFactorRiskAccepted,
}) => {
  const { t } = useTranslation(["common", "trade"])

  const isIceEnabled = useIsIceEnabled()
  const { update, ...tradeSettings } = useTradeSettings()
  const { info } = useToasts()

  const {
    swap: {
      single: { swapSlippage },
    },
  } = tradeSettings

  const priceImpact = Math.abs(
    swap?.priceImpactPct ?? twap?.tradeImpactPct ?? 0,
  )

  const threshold = getMaxSlippageThreshold(priceImpact)
  const validSlippage = Big(priceImpact).plus(threshold).toNumber()

  const handleChangeSlippage = () => {
    update({
      ...tradeSettings,
      swap: {
        ...tradeSettings.swap,
        single: { swapSlippage: validSlippage },
      },
    })

    info({
      title: t("trade:swap.settings.single.toast", {
        value: validSlippage,
      }),
      meta: {
        txHash: "",
        ecosystem: CallType.Substrate,
        srcChainKey: "",
        type: TransactionType.Onchain,
      },
    })
  }

  // A split trade is always an intent, which this check does not apply to
  const shouldRenderSlippageWarning =
    !isIceEnabled &&
    isSingleTrade &&
    isFormValid &&
    Number(swapSlippage) < validSlippage

  if (!shouldRenderSlippageWarning && !healthFactor) {
    return null
  }

  return (
    <>
      {shouldRenderSlippageWarning && (
        <Alert
          variant="warning"
          description={t("trade:market.warnings.slippage.swap.desc", {
            value: validSlippage,
          })}
          action={
            <Flex justify="flex-end" align="center" width="100%">
              <TextButton
                onClick={handleChangeSlippage}
                sx={{ color: getToken("accents.alertAlt.primary") }}
                icon={
                  <Pencil
                    size={12}
                    strokeWidth={2}
                    sx={{ alignSelf: "baseline", ml: "xs" }}
                  />
                }
              >
                {t("trade:market.warnings.slippage.cta", {
                  value: validSlippage,
                })}
              </TextButton>
            </Flex>
          }
        />
      )}

      {healthFactor && (
        <HealthFactorRiskWarning
          canContinue={isFormValid}
          message={t("healthFactor.warning")}
          accepted={healthFactorRiskAccepted}
          isUserConsentRequired={healthFactor.isUserConsentRequired}
          onAcceptedChange={setHealthFactorRiskAccepted}
        />
      )}
    </>
  )
}

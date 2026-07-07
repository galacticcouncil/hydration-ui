import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/sor"
import { Pencil } from "@galacticcouncil/ui/assets/icons"
import { Alert, Flex, TextButton } from "@galacticcouncil/ui/components"
import { Link, useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { LINKS } from "@/config/navigation"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly isFormValid: boolean
  readonly isSingleTrade: boolean
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly setHealthFactorRiskAccepted: (accepted: boolean) => void
}

const SLIPPAGE_WARNING_THRESHOLD = 1

export const MarketWarnings: FC<Props> = ({
  isFormValid,
  isSingleTrade,
  swap,
  twap,
  healthFactor,
  healthFactorRiskAccepted,
  setHealthFactorRiskAccepted,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const search = useSearch({ from: "/trade/_history/swap" })

  const { update, ...tradeSettings } = useTradeSettings()
  const {
    swap: {
      single: { swapSlippage },
      split: { twapSlippage },
    },
  } = tradeSettings

  const priceImpact =
    Math.abs(swap?.priceImpactPct ?? twap?.tradeImpactPct ?? 0) +
    SLIPPAGE_WARNING_THRESHOLD

  const validSlippage = priceImpact

  const handleChangeSlippage = () => {
    if (isSingleTrade) {
      update({
        ...tradeSettings,
        swap: {
          ...tradeSettings.swap,
          single: { swapSlippage: validSlippage },
        },
      })
    } else {
      update({
        ...tradeSettings,
        swap: {
          ...tradeSettings.swap,
          split: {
            ...tradeSettings.swap.split,
            twapSlippage: validSlippage,
          },
        },
      })
    }
  }

  const shouldRenderSlippageWarning =
    Number(isSingleTrade ? swapSlippage : twapSlippage) < priceImpact

  const shouldRenderHealthFactorWarning =
    !!healthFactor &&
    Big(healthFactor.future).gt(1) &&
    healthFactor.isUserConsentRequired &&
    healthFactor.future < healthFactor.current

  if (!shouldRenderSlippageWarning && !shouldRenderHealthFactorWarning) {
    return null
  }

  return (
    <Flex direction="column" gap="s" mt="base">
      {shouldRenderSlippageWarning && (
        <Alert
          variant="warning"
          description={t(
            isSingleTrade
              ? "trade:market.warnings.slippage.swap.desc"
              : "trade:market.warnings.slippage.twap.desc",
            {
              value: validSlippage,
            },
          )}
          action={
            <Flex justify="space-between" align="center" width="100%">
              <TextButton direction="internal" variant="plain">
                <Link
                  to={LINKS.swapDca}
                  search={search}
                  sx={{ textDecoration: "none" }}
                >
                  {t("trade:market.warnings.dca.cta")}
                </Link>
              </TextButton>

              <TextButton
                onClick={handleChangeSlippage}
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

      {shouldRenderHealthFactorWarning && (
        <HealthFactorRiskWarning
          canContinue={isFormValid}
          message={t("healthFactor.warning")}
          accepted={healthFactorRiskAccepted}
          isUserConsentRequired={healthFactor.isUserConsentRequired}
          onAcceptedChange={setHealthFactorRiskAccepted}
        />
      )}
    </Flex>
  )
}

import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Alert, Flex, Modal, TextButton } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { SettingsModal } from "@/modules/trade/swap/components/SettingsModal/SettingsModal"
import { useTradeSettings } from "@/states/tradeSettings"

type Props = {
  readonly isSingleTrade: boolean
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly setHealthFactorRiskAccepted: (accepted: boolean) => void
}

export const MarketWarnings: FC<Props> = ({
  isSingleTrade,
  twap,
  healthFactor,
  healthFactorRiskAccepted,
  setHealthFactorRiskAccepted,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { t } = useTranslation(["common", "trade"])

  const {
    swap: {
      split: { twapSlippage },
    },
  } = useTradeSettings()

  const hasTwap = !isSingleTrade && twap

  const shouldRenderSlippageWarning =
    hasTwap &&
    Math.abs(twap.tradeImpactPct) < 5 &&
    Number(twapSlippage) < Math.abs(twap.tradeImpactPct)

  const shouldRenderDcaWarning = hasTwap && Math.abs(twap.tradeImpactPct) > 5

  const shouldRenderHealthFactorWarning = !!healthFactor?.isUserConsentRequired

  if (
    !shouldRenderSlippageWarning &&
    !shouldRenderDcaWarning &&
    !shouldRenderHealthFactorWarning
  ) {
    return null
  }

  return (
    <Flex direction="column" gap={6} mt={8}>
      {shouldRenderSlippageWarning && (
        <Alert
          variant="warning"
          description={t("trade:market.warn.changeSlippage")}
          action={
            <TextButton
              variant="underline"
              onClick={() => setIsSettingsOpen(true)}
            >
              {t("trade:market.warn.changeSlippage.cta")}
            </TextButton>
          }
        />
      )}
      {shouldRenderDcaWarning && (
        <Alert
          variant="warning"
          description={t("trade:market.warn.useDca")}
          action={
            <Link to="/trade/swap/dca">
              <TextButton variant="underline">
                {t("trade:market.warn.useDca.cta")}
              </TextButton>
            </Link>
          }
        />
      )}
      {shouldRenderHealthFactorWarning && (
        <HealthFactorRiskWarning
          message={t("healthFactor.warning")}
          accepted={healthFactorRiskAccepted}
          isUserConsentRequired={healthFactor.isUserConsentRequired}
          onAcceptedChange={setHealthFactorRiskAccepted}
        />
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

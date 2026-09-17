import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { Alert, Flex } from "@galacticcouncil/ui/components"
import { useFormContext } from "react-hook-form"

import { TradeWarnings } from "@/modules/trade/swap/sections/XcSwap/components/TradeWarnings"
import { useXcSwapAlerts } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

type Props = {
  /** Set only when the risk warning should be shown. */
  readonly healthFactor: HealthFactorResult | undefined
  readonly canContinue: boolean
  readonly isRiskAccepted: boolean
  readonly onIsRiskAcceptedChange: (accepted: boolean) => void
}

export const XcSwapAlerts = ({
  healthFactor,
  canContinue,
  isRiskAccepted,
  onIsRiskAcceptedChange,
}: Props) => {
  const { quote } = useXcSwap()
  const { alerts } = useXcSwapAlerts()
  const { watch } = useFormContext<XcSwapFormValues>()

  const isSingleTrade = watch("isSingleTrade")
  const onChainQuote = quote?.kind === "oc" ? quote : null

  if (!alerts.length && !healthFactor) {
    return null
  }

  return (
    <Flex direction="column" gap="s" py="l">
      {alerts.map((alert) => (
        <Alert
          key={alert.key}
          variant={alert.severity}
          description={alert.message}
        />
      ))}
      <TradeWarnings
        isFormValid={canContinue}
        isSingleTrade={isSingleTrade}
        swap={onChainQuote?.swap}
        twap={onChainQuote?.twap}
        healthFactor={healthFactor}
        healthFactorRiskAccepted={isRiskAccepted}
        setHealthFactorRiskAccepted={onIsRiskAcceptedChange}
      />
    </Flex>
  )
}

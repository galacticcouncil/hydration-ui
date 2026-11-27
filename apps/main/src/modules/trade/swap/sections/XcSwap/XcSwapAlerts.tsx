import { Alert, Flex } from "@galacticcouncil/ui/components"

import { HealthFactorResult } from "@/api/aave"
import { TradeWarnings } from "@/modules/trade/swap/sections/XcSwap/components/TradeWarnings"
import { useXcSwapAlerts } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"

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
  const { alerts } = useXcSwapAlerts()

  return (
    <Flex
      direction="column"
      gap="s"
      py="l"
      sx={{ "&:empty": { display: "none" } }}
    >
      {alerts.map((alert) => (
        <Alert
          key={alert.key}
          variant={alert.severity}
          description={alert.message}
        />
      ))}
      <TradeWarnings
        isFormValid={canContinue}
        healthFactor={healthFactor}
        healthFactorRiskAccepted={isRiskAccepted}
        setHealthFactorRiskAccepted={onIsRiskAcceptedChange}
      />
    </Flex>
  )
}

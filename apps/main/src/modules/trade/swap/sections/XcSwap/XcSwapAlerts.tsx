import { Alert, Flex } from "@galacticcouncil/ui/components"

import { useXcSwapAlerts } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapAlerts"

export const XcSwapAlerts = () => {
  const alerts = useXcSwapAlerts()

  if (!alerts.length) {
    return null
  }

  return (
    <Flex direction="column" gap="s" mt="base">
      {alerts.map((alert) => (
        <Alert
          key={alert.key}
          variant={alert.severity}
          description={alert.message}
        />
      ))}
    </Flex>
  )
}

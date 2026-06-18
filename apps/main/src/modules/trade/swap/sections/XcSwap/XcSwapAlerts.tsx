import { Alert, Flex } from "@galacticcouncil/ui/components"

import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"

export const XcSwapAlerts = () => {
  const { alerts } = useXcSwap()

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

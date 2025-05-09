import { Text } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_trade/trade/bonds")({
  component: () => (
    <Text as="h1" fs={40} font="primary">
      Bonds
    </Text>
  ),
})

import { Text } from "@galacticcouncil/ui/components"
import { createLazyFileRoute } from "@tanstack/react-router"

export const Route = createLazyFileRoute("/_trade/trade/bonds")({
  component: () => (
    <Text as="h1" fs={40} font="primary">
      Bonds
    </Text>
  ),
})

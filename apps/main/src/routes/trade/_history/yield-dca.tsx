import { Text } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/trade/_history/yield-dca")({
  component: () => (
    <Text as="h1" fs="h3" font="primary">
      Yield DCA
    </Text>
  ),
})

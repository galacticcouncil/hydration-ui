import { Skeleton, Text } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"

const WalletTransactionsSkeleton = () => (
  <>
    <Text as="h1" mb={20}>
      <Skeleton />
    </Text>
    <Text>
      <Skeleton count={20} />
    </Text>
  </>
)

export const Route = createFileRoute("/_wallet/wallet/transactions")({
  pendingComponent: WalletTransactionsSkeleton,
})

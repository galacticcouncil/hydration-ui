import { Skeleton, Text } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"

import { postsQuery } from "@/api/posts"

const WalletAssetsSkeleton = () => (
  <>
    <Text as="h1" mb={20}>
      <Skeleton />
    </Text>
    <Text>
      <Skeleton count={20} />
    </Text>
  </>
)

export const Route = createFileRoute("/_wallet/wallet/assets")({
  pendingComponent: WalletAssetsSkeleton,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQuery),
})

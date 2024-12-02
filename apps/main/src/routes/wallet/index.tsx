import { Skeleton, Text } from "@galacticcouncil/ui/components"
import { createFileRoute } from "@tanstack/react-router"

import { postsQuery } from "@/api/posts"

const WalletPageSkeleton = () => (
  <>
    <Text as="h1" mb={20}>
      <Skeleton />
    </Text>
    <Text>
      <Skeleton count={20} />
    </Text>
  </>
)

export const Route = createFileRoute("/wallet/")({
  pendingComponent: WalletPageSkeleton,
  errorComponent: ({ error }) => (
    <div>
      <p>Something went wrong. Please try again later</p>
      <pre>{error?.message}</pre>
    </div>
  ),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQuery),
})

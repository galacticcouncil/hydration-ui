import { createFileRoute } from "@tanstack/react-router"

import { postsQuery } from "@/api/posts"

export const Route = createFileRoute("/wallet/")({
  pendingComponent: () => <div>Loading wallet...</div>,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQuery),
})

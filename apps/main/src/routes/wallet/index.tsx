import { createFileRoute } from "@tanstack/react-router"

import { postsQuery } from "@/api/posts"

export const Route = createFileRoute("/wallet/")({
  pendingComponent: () => <div>Loading wallet...</div>,
  errorComponent: ({ error }) => (
    <div>
      <p>Something went wrong. Please try again later</p>
      <pre>{error?.message}</pre>
    </div>
  ),
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(postsQuery),
})

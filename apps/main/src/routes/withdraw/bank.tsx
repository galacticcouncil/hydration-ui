import { createFileRoute } from "@tanstack/react-router"

import { OnrampRedirect } from "@/modules/onramp/OnrampRedirect"

export const Route = createFileRoute("/withdraw/bank")({
  component: () => <OnrampRedirect modal="bankWithdraw" />,
})

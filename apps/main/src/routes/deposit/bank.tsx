import { createFileRoute } from "@tanstack/react-router"

import { OnrampRedirect } from "@/modules/onramp/OnrampRedirect"

export const Route = createFileRoute("/deposit/bank")({
  component: () => <OnrampRedirect modal="bankDeposit" />,
})

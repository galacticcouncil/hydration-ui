import { useAccount } from "@galacticcouncil/web3-connect"
import { createFileRoute } from "@tanstack/react-router"

import { getPageMeta } from "@/config/navigation"
import { XcScanHistory } from "@/modules/xcm/history"

export const Route = createFileRoute("/cross-chain/history")({
  component: XcScanHistoryPage,
  head: ({
    match: {
      context: { i18n },
    },
  }) => ({
    meta: getPageMeta("crossChainHistory", i18n.t),
  }),
})

function XcScanHistoryPage() {
  const { account } = useAccount()
  const address = account?.address ?? ""

  return <XcScanHistory address={address} />
}

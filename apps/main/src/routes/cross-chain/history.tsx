import { useAccount } from "@galacticcouncil/web3-connect"
import { createFileRoute } from "@tanstack/react-router"
import z from "zod"

import { getPageMeta } from "@/config/navigation"
import { dataTableSortSchema } from "@/form/dataTableSortSchema"
import { XcScanHistory } from "@/modules/xcm/history"

const searchSchema = z.object({
  sort: dataTableSortSchema,
  page: z.number().optional(),
})

export const Route = createFileRoute("/cross-chain/history")({
  component: XcScanHistoryPage,
  validateSearch: searchSchema,
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

import {
  migratedOrdersQuery,
  scheduledOrdersQuery,
} from "@galacticcouncil/indexer/indexer"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { useIndexerClient } from "@/api/indexer"
import {
  buildMigratedScheduleHalves,
  mergeMigratedOrders,
  toMigrationLinks,
} from "@/modules/trade/orders/lib/buildOrderRows"
import { OrderData } from "@/modules/trade/orders/lib/orderData"
import { useDcaGrafanaEnrichment } from "@/modules/trade/orders/lib/useDcaGrafanaEnrichment"
import { useAssets } from "@/providers/assetsProvider"

/**
 * FORK PATH ONLY. There is no neckwork equivalent: the public API publishes
 * nothing for `DCA.Migrated` (no migration endpoint, and an intent row carries
 * no schedule reference), and `DCA.Migrated` is the only thing that says which
 * intent a schedule became.
 *
 * ponytail: measured 2026-09-15 — `DCA.Migrated` has fired ZERO times on
 * mainnet (explorer.hydradx.cloud) and on dev (archive.nice.hydration.cloud),
 * so the neckwork path loses nothing today and merged rows were ruled out of
 * scope for it. The DCA -> ICE migration is pending, not cancelled: the day it
 * first runs, neckwork Order History will show each migrated order as its
 * INTENT HALF ALONE — no budget, no creation time, no pre-migration fills, and
 * sorted by its last event rather than its placement. That is a known gap, not
 * a bug. Fixing it means either a single surviving GraphQL query for the
 * migration links, or a neckwork endpoint that exposes them.
 */
export const useMigratedOrdersMerge = (orders: Array<OrderData>) => {
  const { account } = useAccount()
  const who = safeConvertSS58toPublicKey(account?.address ?? "")

  const indexerSdk = useIndexerClient()

  const { data: migratedData } = useQuery(migratedOrdersQuery(indexerSdk, who))
  const { data: scheduledData } = useQuery(
    scheduledOrdersQuery(indexerSdk, who),
  )

  const { getAssetWithFallback } = useAssets()

  const links = useMemo(
    () => toMigrationLinks(migratedData?.events ?? []),
    [migratedData],
  )

  const halves = useMemo(
    () =>
      buildMigratedScheduleHalves(
        scheduledData?.events ?? [],
        migratedData?.events ?? [],
        getAssetWithFallback,
      ),
    [scheduledData, migratedData, getAssetWithFallback],
  )

  const { orders: enrichedHalves } = useDcaGrafanaEnrichment(halves)

  const merged = useMemo(
    () => mergeMigratedOrders(orders, enrichedHalves, links),
    [orders, enrichedHalves, links],
  )

  return { orders: merged }
}

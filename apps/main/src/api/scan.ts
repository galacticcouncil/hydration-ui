import {
  getScanClient,
  type ScanTransfer,
  scanTransferQuery,
  scanTransfersQuery,
} from "@galacticcouncil/indexer/scan"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { type QueryClient, queryOptions } from "@tanstack/react-query"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import { isNonNullish, sortBy, uniqueBy } from "remeda"

import { wormholeVaaQuery } from "@/api/wormhole"
import { ENV } from "@/config/env"
import {
  journeyDate,
  PENDING_STATUSES,
} from "@/modules/xcm/history/utils/journey"
import {
  isScanTransferInFlight,
  SCAN_ONLY_CHAINS,
  toScanAccount,
  toScanJourney,
} from "@/modules/xcm/history/utils/scan"

export const transfersScanClient = getScanClient(ENV.VITE_TRANSFERS_SCAN_URL)

// Newest first; a claim stays open two weeks, well inside a page
const PAGE_SIZE = 50

/**
 * The vaa of a transfer's ntt leg while the leg awaits redeeming. Without one
 * the transfer shows no claim until a refetch finds it.
 */
const getClaimVaa = async (
  queryClient: QueryClient,
  transfer: ScanTransfer,
) => {
  try {
    const detail = await queryClient.fetchQuery(
      scanTransferQuery(transfersScanClient, transfer.id),
    )
    const record = detail?.record
    const legState =
      transfer.kind === "utxo" ? record?.rail_state : record?.state
    if (!record?.vaa_id || legState === "redeemed") return

    const vaa = await queryClient.fetchQuery(wormholeVaaQuery(record.vaa_id))
    return vaa ?? undefined
  } catch {
    return
  }
}

/**
 * An account's NEAR ntt transfers and Zcash deposits and withdrawals, which
 * xc-scan doesn't index. The scan has them from October 2026 on.
 */
export const scanJourneysQuery = (queryClient: QueryClient, address: string) =>
  queryOptions({
    queryKey: ["scan", "journeys", address],
    enabled: !!address,
    staleTime: secondsToMilliseconds(30),
    // The scan's stream misses a vaa being signed, so a transfer under way is
    // polled until it lands
    refetchInterval: ({ state }) =>
      state.data?.some((journey) => PENDING_STATUSES.includes(journey.status))
        ? minutesToMilliseconds(1)
        : false,
    queryFn: async (): Promise<XcJourney[]> => {
      const q = toScanAccount(address)
      // Either end on one of the chains, so the account's other transfers
      // don't crowd them out of a page
      const pages = await Promise.all(
        [{ from: SCAN_ONLY_CHAINS }, { to: SCAN_ONLY_CHAINS }].map((ends) =>
          queryClient.fetchQuery(
            scanTransfersQuery(transfersScanClient, {
              q,
              ...ends,
              limit: PAGE_SIZE,
            }),
          ),
        ),
      )
      const transfers = uniqueBy(
        pages.flatMap((page) => page.items),
        (transfer) => transfer.id,
      )

      const journeys = await Promise.all(
        transfers.map(async (transfer) =>
          toScanJourney(
            transfer,
            isScanTransferInFlight(transfer)
              ? await getClaimVaa(queryClient, transfer)
              : undefined,
          ),
        ),
      )

      return sortBy(journeys.filter(isNonNullish), [journeyDate, "desc"])
    },
  })

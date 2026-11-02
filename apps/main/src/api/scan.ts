import {
  getScanClient,
  type ScanTransfer,
  scanTransferQuery,
  scanTransfersQuery,
} from "@galacticcouncil/indexer/scan"
import { intentscan, stringEquals } from "@galacticcouncil/utils"
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
  toScanNearHash,
} from "@/modules/xcm/history/utils/scan"

export const transfersScanClient = getScanClient(ENV.VITE_TRANSFERS_SCAN_URL)
export const intentsScanClient = getScanClient(intentscan.apiUrl)

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
 * An account's ntt, Basejump and Zcash transfers, as the scan lists them from
 * October 2026 on.
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
      const nearHash = toScanNearHash(address)
      // NEAR's and Zcash's legs apart, so the account's others don't crowd
      // them out of the page: xc-scan stands in for the rest, not for them
      const filters = [
        { q },
        { q, from: SCAN_ONLY_CHAINS },
        { q, to: SCAN_ONLY_CHAINS },
        ...(nearHash ? [{ q: nearHash, to: SCAN_ONLY_CHAINS }] : []),
      ]
      const pages = await Promise.all(
        filters.map((filter) =>
          queryClient.fetchQuery(
            scanTransfersQuery(transfersScanClient, {
              ...filter,
              limit: PAGE_SIZE,
            }),
          ),
        ),
      )
      const transfers = uniqueBy(
        pages.flatMap((page) => page.items),
        (transfer) => transfer.id,
      ).map((transfer) =>
        // Named where the scan has only the hash
        nearHash && stringEquals(transfer.to_address, nearHash)
          ? { ...transfer, to_address: address }
          : transfer,
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

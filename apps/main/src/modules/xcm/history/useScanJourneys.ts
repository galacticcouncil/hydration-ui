import {
  scanTransferQuery,
  type ScanUpdate,
  subscribeScanEvents,
} from "@galacticcouncil/indexer/scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { isNonNullish } from "remeda"

import { scanJourneysQuery, transfersScanClient } from "@/api/scan"
import { SCAN_JOURNEY_PREFIX } from "@/modules/xcm/history/utils/journey"
import { toScanAccount, toScanNearHash } from "@/modules/xcm/history/utils/scan"

// A burst of row changes refetches once
const REFETCH_DEBOUNCE_MS = 500

/** Whether a row names the account by any of its `names`. */
const namesAccount = (row: Record<string, unknown>, names: string[]) =>
  Object.values(row).some(
    (value) =>
      typeof value === "string" &&
      names.some((name) => value.toLowerCase().includes(name)),
  )

export const useScanJourneys = (address: string) => {
  const queryClient = useQueryClient()

  return useQuery(scanJourneysQuery(queryClient, address))
}

/**
 * Refetches the account's scan journeys when one of its transfers changes,
 * and on a reconnect, since a dropped stream replays nothing.
 */
export const useScanJourneysSubscription = (address: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!address) return

    const { queryKey } = scanJourneysQuery(queryClient, address)
    // In lowercase and unprefixed, as an evm address also sits in a row
    // padded to 32 bytes
    const names = [toScanAccount(address), toScanNearHash(address)]
      .filter(isNonNullish)
      .map((name) => name.toLowerCase().replace(/^0x/, ""))

    const isListed = (id: string) =>
      !!queryClient
        .getQueryData(queryKey)
        ?.some(
          (journey) => journey.correlationId === `${SCAN_JOURNEY_PREFIX}${id}`,
        )

    // The stream carries every account's changes
    const isOwnChange = async (update: ScanUpdate | null) => {
      if (!update) return true
      if (update.flow !== "ntt") return namesAccount(update.record, names)

      // An ntt change comes relayed as its digest and state alone
      const id = `ntt:${update.record.id}`
      if (isListed(id)) return true

      try {
        const detail = await queryClient.fetchQuery(
          scanTransferQuery(transfersScanClient, id),
        )
        return !!detail && namesAccount(detail.view, names)
      } catch {
        return true
      }
    }

    let timeout: ReturnType<typeof setTimeout> | undefined
    let isReconnect = false
    const refetch = () => {
      clearTimeout(timeout)
      timeout = setTimeout(
        () => queryClient.invalidateQueries({ queryKey }),
        REFETCH_DEBOUNCE_MS,
      )
    }

    const unsubscribe = subscribeScanEvents(
      transfersScanClient,
      ["ntt", "utxo", "basejump"],
      {
        onChange: async (update) => {
          if (await isOwnChange(update)) refetch()
        },
        // The first connect finds the journeys just loaded
        onOpen: () => {
          if (isReconnect) refetch()
          isReconnect = true
        },
      },
    )

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [address, queryClient])
}

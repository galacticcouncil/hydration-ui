import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { Binary } from "polkadot-api"

import { useRpcProvider } from "@/providers/rpcProvider"
import { useToasts } from "@/states/toasts"
import { useMultisigWatchStore } from "@/states/multisigWatch"

const POLL_INTERVAL_MS = 6_000
const MAX_WATCH_DURATION_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Mounted globally in TransactionManager. For each pending multisig approval,
 * polls papi.query.Multisig.Multisigs every 6s. When the storage entry
 * disappears (all co-signers have approved and the call was executed),
 * updates the toast to "success" and stops polling.
 */
export const MultisigTxPoller = () => {
  const { t } = useTranslation()
  const { papi, isApiLoaded } = useRpcProvider()
  const { edit } = useToasts()
  const { watches, removeWatch } = useMultisigWatchStore()

  useEffect(() => {
    if (!isApiLoaded || watches.length === 0) return

    const interval = setInterval(async () => {
      const now = Date.now()

      for (const watch of watches) {
        // Stop watching after 30 minutes
        if (now - watch.startedAt > MAX_WATCH_DURATION_MS) {
          removeWatch(watch.toastId)
          continue
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const entry = await (papi as any).query.Multisig.Multisigs.getValue(
            watch.multisigAddress,
            Binary.fromHex(watch.callHash),
          )

          if (entry === undefined) {
            // Storage entry gone → multisig was executed by co-signers
            edit(watch.toastId, {
              variant: "success",
              title: t("transaction.status.multisig.executed.title"),
              dateCreated: new Date().toISOString(),
            })
            removeWatch(watch.toastId)
          }
        } catch {
          // Ignore transient RPC errors; try again next tick
        }
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isApiLoaded, watches, papi, edit, removeWatch, t])

  return null
}

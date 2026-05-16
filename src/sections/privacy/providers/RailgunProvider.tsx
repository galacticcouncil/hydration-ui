// Phase 5b — boots the RAILGUN engine for real:
//   - level-js IndexedDB store
//   - PollingJsonRpcProvider over lark RPC
//   - loadNetwork against the Phase 0 proxy
//   - exposes UTXO merkletree scan progress for the UI
//
// Stays scan-only (no proof artifacts) — that lands with Phase 5c shield.

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import {
  EngineEvent,
  MerkletreeHistoryScanEventData,
  MerkletreeScanStatus,
  RailgunEngine,
} from "@railgun-community/engine"

import { ACTIVE_RAILGUN_CHAIN } from "sections/privacy/utils/networks"
import { bootRailgunEngine } from "sections/privacy/utils/engine"

type RailgunChain = { type: 0; id: number } // ChainType.EVM = 0

type ConnectionState =
  | { status: "idle" }
  | { status: "booting" }
  | { status: "ready"; engine: RailgunEngine }
  | { status: "error"; error: Error }

type ScanState = {
  status: MerkletreeScanStatus | "Idle"
  progress: number // 0..1
}

type RailgunContextValue = {
  state: ConnectionState
  scan: ScanState
  chain: RailgunChain
  config: typeof ACTIVE_RAILGUN_CHAIN
}

const RailgunContext = createContext<RailgunContextValue | null>(null)

export const useRailgunContext = (): RailgunContextValue => {
  const ctx = useContext(RailgunContext)
  if (!ctx) {
    throw new Error(
      "useRailgunContext must be used inside <RailgunProvider>. Mount it in AppProviders.",
    )
  }
  return ctx
}

// Module-level singleton — survives React Strict Mode's double-mount of
// useEffect. The first mount kicks off the boot; subsequent mounts await
// the same promise instead of starting another (or, worse, getting cancelled
// by the first mount's cleanup before they can attach a `.then`).
let enginePromise: Promise<RailgunEngine> | null = null
const getEnginePromise = (
  config: typeof ACTIVE_RAILGUN_CHAIN,
): Promise<RailgunEngine> => {
  if (!enginePromise) {
    enginePromise = bootRailgunEngine(config).then(({ engine }) => engine)
  }
  return enginePromise
}

export const RailgunProvider = ({ children }: { children: ReactNode }) => {
  const config = ACTIVE_RAILGUN_CHAIN
  const chain: RailgunChain = useMemo(
    () => ({ type: 0, id: config.chainId }),
    [config.chainId],
  )
  const [state, setState] = useState<ConnectionState>({ status: "idle" })
  const [scan, setScan] = useState<ScanState>({ status: "Idle", progress: 0 })
  const scanListenerAttachedRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    setState({ status: "booting" })
    getEnginePromise(config)
      .then((engine) => {
        if (cancelled) return

        if (!scanListenerAttachedRef.current) {
          scanListenerAttachedRef.current = true
          engine.on(
            EngineEvent.UTXOMerkletreeHistoryScanUpdate,
            (data: MerkletreeHistoryScanEventData) => {
              setScan({
                status: data.scanStatus,
                progress: data.progress ?? 0,
              })
            },
          )
          // No wallet filter yet — wallets injected from useRailgunWallet
          engine.scanContractHistory(chain, undefined).catch((e) => {
            // eslint-disable-next-line no-console
            console.error("[RailgunProvider] initial scan failed:", e)
          })
        }

        setState({ status: "ready", engine })
      })
      .catch((e) => {
        if (cancelled) return
        const err = e instanceof Error ? e : new Error(String(e))
        // eslint-disable-next-line no-console
        console.error("[RailgunProvider] engine boot failed:", err)
        setState({ status: "error", error: err })
      })

    return () => {
      cancelled = true
      // Don't unload the engine here — the singleton outlives any single
      // mount cycle and is reused across the SPA's lifetime.
    }
  }, [config, chain])

  const value: RailgunContextValue = useMemo(
    () => ({ state, scan, chain, config }),
    [state, scan, chain, config],
  )

  return (
    <RailgunContext.Provider value={value}>{children}</RailgunContext.Provider>
  )
}

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

export const RailgunProvider = ({ children }: { children: ReactNode }) => {
  const config = ACTIVE_RAILGUN_CHAIN
  const chain: RailgunChain = useMemo(
    () => ({ type: 0, id: config.chainId }),
    [config.chainId],
  )
  const [state, setState] = useState<ConnectionState>({ status: "idle" })
  const [scan, setScan] = useState<ScanState>({ status: "Idle", progress: 0 })
  const bootedRef = useRef(false)

  useEffect(() => {
    if (bootedRef.current) return
    bootedRef.current = true

    let engineRef: RailgunEngine | null = null
    let cancelled = false

    setState({ status: "booting" })
    bootRailgunEngine(config)
      .then(({ engine }) => {
        if (cancelled) return
        engineRef = engine

        engine.on(
          EngineEvent.UTXOMerkletreeHistoryScanUpdate,
          (data: MerkletreeHistoryScanEventData) => {
            setScan({
              status: data.scanStatus,
              progress: data.progress ?? 0,
            })
          },
        )

        setState({ status: "ready", engine })

        // Kick off the initial scan. No wallet filter yet — wallets get
        // injected from `useRailgunWallet` and the engine picks them up
        // automatically on the next scanContractHistory pass.
        engine.scanContractHistory(chain, undefined).catch((e) => {
          // eslint-disable-next-line no-console
          console.error("[RailgunProvider] initial scan failed:", e)
        })
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
      if (engineRef) {
        engineRef.unload().catch(() => undefined)
      }
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

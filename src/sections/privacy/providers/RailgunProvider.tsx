// Phase 5a — verifies the RAILGUN engine package imports cleanly and exposes
// the configured Hydration chain to children. Full `RailgunEngine.initForWallet`
// boot moves to Phase 5b once an idb-backed leveldown adapter is in place
// (engine requires an `AbstractLevelDOWN` it does not ship a browser adapter for).
//
// What 5a proves: package resolution, ethers v6 coexistence, provider can be
// reached from anywhere under the existing AppProviders tree.
// What 5b adds: real engine init + Subsquid quickSync + IndexedDB store.

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { RailgunEngine } from "@railgun-community/engine"
import { ACTIVE_RAILGUN_CHAIN } from "sections/privacy/utils/networks"

type RailgunChain = { type: 0; id: number } // ChainType.EVM = 0

type ConnectionState =
  | { status: "idle" }
  | { status: "ready" }
  | { status: "error"; error: Error }

type RailgunContextValue = {
  state: ConnectionState
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

  useEffect(() => {
    // Smoke-check: confirm the engine module resolves and exposes its
    // factory. Actual init is deferred to 5b.
    try {
      if (typeof RailgunEngine.initForWallet !== "function") {
        throw new Error(
          "RailgunEngine.initForWallet is not a function — engine package resolution may have failed",
        )
      }
      setState({ status: "ready" })
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      // eslint-disable-next-line no-console
      console.error("[RailgunProvider] smoke-check failed:", err)
      setState({ status: "error", error: err })
    }
  }, [])

  const value: RailgunContextValue = useMemo(
    () => ({ state, chain, config }),
    [state, chain, config],
  )

  return (
    <RailgunContext.Provider value={value}>{children}</RailgunContext.Provider>
  )
}

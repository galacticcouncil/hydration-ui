// Phase 5d — broadcaster context.
//
// Owns:
//   - the in-memory list of known broadcasters (mock until Phase 3 lands)
//   - the currently-selected broadcaster (null = self-relay)
//   - a `broadcastTransaction(signedTx)` thunk that consumers (send / unshield
//     / swap flows) call instead of `wallet.sendTransaction` directly
//
// Mounting: this provider sits *inside* RailgunProvider in AppProviders.tsx so
// that it can read the active chain off useRailgunContext(). Today it doesn't
// need the engine, but the real waku client will (BroadcasterConnection takes
// the same Chain object the engine boots with).

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  Broadcaster,
  MOCK_BROADCASTERS,
} from "sections/privacy/utils/broadcasters"

export type BroadcastResult = {
  txHash: string
  /** True if the broadcaster relayed it, false if we fell back to self-relay. */
  viaBroadcaster: boolean
}

type BroadcasterContextValue = {
  /** Discovered broadcasters. May be empty (no relayers online). */
  broadcasters: Broadcaster[]
  /** Currently picked broadcaster, or null if the user opted into self-relay. */
  selected: Broadcaster | null
  /** Update the picked broadcaster. Pass null for self-relay. */
  selectBroadcaster: (b: Broadcaster | null) => void
  /** Force a re-poll of the waku topic. No-op against the mock. */
  refresh: () => void
  /**
   * Relay (or self-relay) a signed transaction. Returns the broadcast tx hash.
   * Self-relay needs a `selfRelay` callback (the EVM wallet's sendTransaction)
   * because this provider doesn't own the user's signer.
   */
  broadcastTransaction: (args: {
    signedTx: string
    selfRelay?: () => Promise<string>
  }) => Promise<BroadcastResult>
  /** True iff the broadcaster list is mock data (Phase 3 fork hasn't shipped). */
  isMock: boolean
}

const BroadcasterContext = createContext<BroadcasterContextValue | null>(null)

export const useBroadcasterContext = (): BroadcasterContextValue => {
  const ctx = useContext(BroadcasterContext)
  if (!ctx) {
    throw new Error(
      "useBroadcasterContext must be used inside <BroadcasterProvider>. Mount it in AppProviders, inside RailgunProvider.",
    )
  }
  return ctx
}

export const BroadcasterProvider = ({ children }: { children: ReactNode }) => {
  // `chain` is read so this provider is structurally ready for the real
  // waku-broadcaster-client wiring, which needs the same {type,id} shape the
  // engine boots with. Today the mock dataset ignores it.
  const { chain } = useRailgunContext()

  const [broadcasters, setBroadcasters] = useState<Broadcaster[]>([])
  const [selected, setSelected] = useState<Broadcaster | null>(null)

  const refresh = useCallback(() => {
    // Phase 3+: BroadcasterConnection.startWakuClient(chain, ...) and feed
    // its FeesUpdate event into setBroadcasters. For now, return the static
    // mock list with a fresh lastSeenAt stamp so the UI animates.
    setBroadcasters(
      MOCK_BROADCASTERS.map((b) => ({ ...b, lastSeenAt: Date.now() })),
    )
  }, [])

  // Initial population + chain-change re-discovery.
  useEffect(() => {
    refresh()
  }, [refresh, chain.id])

  // Auto-pick the first broadcaster the first time a list shows up. The user
  // can override via the picker, including back to null (self-relay).
  useEffect(() => {
    setSelected((current) => current ?? broadcasters[0] ?? null)
  }, [broadcasters])

  const selectBroadcaster = useCallback((b: Broadcaster | null) => {
    setSelected(b)
  }, [])

  const broadcastTransaction = useCallback<
    BroadcasterContextValue["broadcastTransaction"]
  >(
    async ({ signedTx, selfRelay }) => {
      // No broadcaster picked OR no broadcasters online → self-relay (the
      // user's EVM wallet sends the tx itself and pays gas in the native
      // gas token).
      if (!selected) {
        if (!selfRelay) {
          throw new Error(
            "No broadcaster selected and no self-relay fallback provided.",
          )
        }
        const txHash = await selfRelay()
        return { txHash, viaBroadcaster: false }
      }

      // Phase 3+: BroadcasterConnection.transact({ ... }) — the real client
      // serializes the signed tx into an encrypted waku message and waits for
      // the broadcaster's ack. Until then we throw a clearly-labeled error so
      // the caller can decide whether to fall back to self-relay or surface
      // it to the user.
      //
      // We accept `signedTx` here (instead of the unsigned transaction +
      // signer) because the engine already produces a signed
      // `populateProvedTransaction` payload by the time we hand it off.
      void signedTx
      throw new Error(
        "Broadcaster transport not wired yet — Phase 5d ships UI + selection only. The real Waku client lands once @railgun-community/waku-broadcaster-client is published with NetworkName.Hydration (Phase 3 shared-models fork).",
      )
    },
    [selected],
  )

  const value = useMemo<BroadcasterContextValue>(
    () => ({
      broadcasters,
      selected,
      selectBroadcaster,
      refresh,
      broadcastTransaction,
      isMock: true,
    }),
    [broadcasters, selected, selectBroadcaster, refresh, broadcastTransaction],
  )

  return (
    <BroadcasterContext.Provider value={value}>
      {children}
    </BroadcasterContext.Provider>
  )
}

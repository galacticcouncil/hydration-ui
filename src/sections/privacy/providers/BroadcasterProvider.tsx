// Phase 5d — broadcaster context (real Waku wiring).
//
// Owns:
//   - the in-memory list of known broadcasters, populated from
//     `WakuBroadcasterClient.findAllBroadcastersForChain(...)` after the
//     vendored waku client finishes its first discovery poll
//   - the currently-selected broadcaster (null = self-relay)
//   - a `broadcastTransaction(signedTx, selfRelay?)` thunk that consumers
//     (send / unshield / swap flows) call instead of `wallet.sendTransaction`
//     directly
//
// Mounting: this provider sits *inside* RailgunProvider in AppProviders.tsx
// because the Waku client takes the same `Chain` object the engine boots
// with. We start the client lazily on first mount and cache the result on
// the module so React Strict Mode's double-mount doesn't spawn two Waku
// nodes (which would each contend for the LightPush + Filter peers).
//
// FALLBACK CONTRACT: every error path (Waku start failure, no broadcasters
// online, broadcaster transact path not wired) MUST fall through to
// `selfRelay()`. The user can always submit a transaction even with Waku
// totally broken.

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  BroadcasterConnectionStatus,
  type Chain as RailgunChain,
  type SelectedBroadcaster,
  WakuBroadcasterClient,
} from "@galacticcouncil/railgun-waku-broadcaster-client"

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
  /** Force a re-poll of the waku topic. */
  refresh: () => void
  /** Connection status of the underlying Waku client. */
  status: BroadcasterConnectionStatus
  /**
   * Relay (or self-relay) a signed transaction. Returns the broadcast tx
   * hash. Self-relay needs a `selfRelay` callback (the EVM wallet's
   * sendTransaction) because this provider doesn't own the user's signer.
   */
  broadcastTransaction: (args: {
    signedTx: string
    selfRelay?: () => Promise<string>
  }) => Promise<BroadcastResult>
  /**
   * True while we're rendering MOCK_BROADCASTERS (i.e. the live client
   * failed to start, or we're inside the brief window between mount and
   * first fee announcement). Flips to false once `WakuBroadcasterClient`
   * reaches `Connected` + at least one broadcaster announcement arrives.
   */
  isMock: boolean
  /**
   * Human-readable diagnostic for the picker. Surfaced in the "no
   * broadcasters online" empty state when self-relay is being used.
   */
  fallbackReason: string | null
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

// ---- Module-level singleton ---------------------------------------------
//
// React Strict Mode mounts every effect twice in development. Starting two
// Waku LightNodes against the same shard would fight for the same peer
// slots, so we cache the start promise here and reuse it across mounts.

type WakuStartResult =
  | { ok: true }
  | { ok: false; error: Error }

let wakuStartPromise: Promise<WakuStartResult> | null = null
// Module-level mutable callback so re-mounts (e.g. React Strict Mode) can
// swap in their own `setStatus` without losing updates. The Waku client
// only registers the FIRST callback it sees, so we wire it once at start
// time and have it call through this ref each invocation.
let currentStatusListener:
  | ((s: BroadcasterConnectionStatus) => void)
  | null = null
const ensureWakuStarted = (
  chain: RailgunChain,
  onStatus: (s: BroadcasterConnectionStatus) => void,
): Promise<WakuStartResult> => {
  currentStatusListener = onStatus
  if (wakuStartPromise) {
    return wakuStartPromise
  }
  wakuStartPromise = (async (): Promise<WakuStartResult> => {
    try {
      await WakuBroadcasterClient.start(
        chain,
        {
          // No trusted-fee-signer gating on Hydration — accept any
          // announcement on the topic. Must be `undefined`, not `[]`:
          // empty arrays are truthy in JS, so passing `[]` would trigger
          // findBroadcastersForToken's "trustedFeeSigner set" branch and
          // reject every broadcaster for lack of an authorized fee.
          trustedFeeSigner: undefined,
          // POI gating is disabled on the Hydration deployment. The fee
          // cache short-circuits if any requiredPOIListKey isn't in this
          // array, so an empty list means "no POI lists active".
          poiActiveListKeys: [],
          enableHealthcheckLogs: false,
        },
        (_chain, status) => {
          // Always route through the latest listener — not the `onStatus`
          // closure captured at start time, which would be the first
          // (cancelled) mount's setter under React Strict Mode.
          currentStatusListener?.(status)
        },
        {
          // Pipe BroadcasterDebug.log into the console; the cache's debug
          // surface is otherwise silent in production builds.
          // eslint-disable-next-line no-console
          log: (msg) => console.log("[waku-broadcaster]", msg),
          // eslint-disable-next-line no-console
          error: (err) => console.error("[waku-broadcaster]", err),
        },
      )
      return { ok: true }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      // eslint-disable-next-line no-console
      console.warn(
        "[BroadcasterProvider] Waku start failed; falling back to self-relay only:",
        error,
      )
      return { ok: false, error }
    }
  })()
  return wakuStartPromise
}

// Convert a `SelectedBroadcaster` (1 broadcaster × 1 token) into our flat
// `Broadcaster` shape (1 broadcaster × N tokens). The Waku client returns
// one selected entry per (broadcaster, token), so we collapse by
// railgunAddress here.
const aggregateBroadcasters = (
  list: SelectedBroadcaster[],
): Broadcaster[] => {
  const byAddress = new Map<string, Broadcaster>()
  for (const sel of list) {
    const existing = byAddress.get(sel.railgunAddress)
    const fee = {
      // SelectedBroadcaster.tokenAddress is plain string upstream; ours is
      // narrower (`0x${string}`) so we cast at the boundary.
      tokenAddress: sel.tokenAddress as `0x${string}`,
      // Symbol resolution lives outside this provider (asset registry);
      // until we wire it, show the address as-is. The picker tolerates a
      // shortened address as a symbol.
      symbol: sel.tokenAddress.slice(0, 6) + "…" + sel.tokenAddress.slice(-4),
      feePerUnitGas: sel.tokenFee.feePerUnitGas,
      expiration: sel.tokenFee.expiration,
    }
    if (existing) {
      existing.fees.push(fee)
      // Track the latest seen-at as the row stamp.
      existing.lastSeenAt = Date.now()
      continue
    }
    byAddress.set(sel.railgunAddress, {
      railgunAddress: sel.railgunAddress,
      identifier: shortenAddress(sel.railgunAddress),
      version: "unknown",
      relayAdapt:
        (sel.tokenFee.relayAdapt as `0x${string}` | undefined) ??
        ("0x0000000000000000000000000000000000000000" as const),
      reliability: sel.tokenFee.reliability,
      availableWallets: sel.tokenFee.availableWallets,
      lastSeenAt: Date.now(),
      requiredPOIListKeys: [],
      fees: [fee],
      __MOCK__: false,
    })
  }
  return Array.from(byAddress.values())
}

const shortenAddress = (a: string) =>
  a.length < 13 ? a : `${a.slice(0, 8)}…${a.slice(-4)}`

export const BroadcasterProvider = ({ children }: { children: ReactNode }) => {
  const { chain } = useRailgunContext()

  const [broadcasters, setBroadcasters] = useState<Broadcaster[]>([])
  const [selected, setSelected] = useState<Broadcaster | null>(null)
  const [status, setStatus] = useState<BroadcasterConnectionStatus>(
    BroadcasterConnectionStatus.Disconnected,
  )
  const [isMock, setIsMock] = useState(true)
  const [fallbackReason, setFallbackReason] = useState<string | null>(
    "Connecting to Waku broadcaster network…",
  )

  // Track whether we've seen at least one real announcement. The picker
  // keeps the MOCK badge until the cache has populated; without that the
  // first render flashes "0 broadcasters online" before discovery
  // completes, which reads as a regression.
  const sawRealAnnouncementRef = useRef(false)

  const refresh = useCallback(() => {
    if (!WakuBroadcasterClient.isStarted()) {
      // Either still starting, or start failed. Mock data stays visible.
      setBroadcasters(
        MOCK_BROADCASTERS.map((b) => ({ ...b, lastSeenAt: Date.now() })),
      )
      return
    }
    let live: SelectedBroadcaster[] | undefined
    try {
      live =
        WakuBroadcasterClient.findAllBroadcastersForChain(chain, true) ?? []
    } catch (e) {
      // findAllBroadcastersForChain throws "Chain not found" if the shim
      // somehow doesn't know about Hydration. Swallow + log + fall back.
      // eslint-disable-next-line no-console
      console.warn(
        "[BroadcasterProvider] findAllBroadcastersForChain threw, falling back:",
        e,
      )
      live = []
    }
    const aggregated = aggregateBroadcasters(live)
    if (aggregated.length > 0) {
      sawRealAnnouncementRef.current = true
      setIsMock(false)
      setFallbackReason(null)
      setBroadcasters(aggregated)
      return
    }
    // No live broadcasters. Don't show MOCK rows once Waku is up — they're
    // confusing. Just show an empty list; the picker renders the empty
    // state with the fallback reason.
    if (sawRealAnnouncementRef.current) {
      setBroadcasters([])
      setFallbackReason("No broadcasters online — falling back to self-relay.")
    } else {
      setBroadcasters(
        MOCK_BROADCASTERS.map((b) => ({ ...b, lastSeenAt: Date.now() })),
      )
      setFallbackReason("Searching for broadcasters on the Waku network…")
    }
  }, [chain])

  // Start the Waku client + poll for fee announcements.
  useEffect(() => {
    let cancelled = false
    let interval: ReturnType<typeof setInterval> | undefined

    ensureWakuStarted(chain, (next) => {
      if (cancelled) return
      setStatus(next)
    })
      .then((result) => {
        if (cancelled) return
        if (!result.ok) {
          // Waku didn't start. Keep MOCK data visible so the picker still
          // renders and self-relay still works.
          setIsMock(true)
          setFallbackReason(
            `Waku unavailable (${result.error.message}). Self-relay only.`,
          )
          refresh()
          return
        }
        // Initial pull, then poll every 5s. The vendored client receives
        // fee messages asynchronously; we just read the cache.
        refresh()
        interval = setInterval(refresh, 5_000)
      })
      .catch((e) => {
        if (cancelled) return
        // eslint-disable-next-line no-console
        console.error("[BroadcasterProvider] unexpected start error:", e)
      })

    return () => {
      cancelled = true
      if (interval) clearInterval(interval)
    }
  }, [chain, refresh])

  // Auto-pick the first broadcaster the first time a real list shows up.
  // The user can override via the picker, including back to null
  // (self-relay).
  useEffect(() => {
    setSelected((current) => {
      if (current) {
        // If our selection is stale (gone from the list), drop it.
        const stillThere = broadcasters.find(
          (b) => b.railgunAddress === current.railgunAddress,
        )
        return stillThere ?? null
      }
      // Don't auto-pick a MOCK row — self-relay is the safe default.
      const firstReal = broadcasters.find((b) => !b.__MOCK__)
      return firstReal ?? null
    })
  }, [broadcasters])

  const selectBroadcaster = useCallback((b: Broadcaster | null) => {
    setSelected(b)
  }, [])

  const broadcastTransaction = useCallback<
    BroadcasterContextValue["broadcastTransaction"]
  >(
    async ({ signedTx, selfRelay }) => {
      // No broadcaster selected → self-relay.
      if (!selected) {
        if (!selfRelay) {
          throw new Error(
            "No broadcaster selected and no self-relay fallback provided.",
          )
        }
        const txHash = await selfRelay()
        return { txHash, viaBroadcaster: false }
      }

      // MOCK broadcaster selected (Waku didn't come up) → self-relay.
      if (selected.__MOCK__) {
        if (!selfRelay) {
          throw new Error(
            "Mock broadcaster selected and no self-relay fallback provided.",
          )
        }
        // eslint-disable-next-line no-console
        console.warn(
          "[BroadcasterProvider] selected broadcaster is mock data; falling back to self-relay",
        )
        const txHash = await selfRelay()
        return { txHash, viaBroadcaster: false }
      }

      // Real broadcaster selected. We do not have the encrypted-transact
      // path wired yet — that requires `@railgun-community/wallet`
      // (encryptDataWithSharedKey, getRailgunWalletAddressData,
      // verifyBroadcasterSignature). Until those land, fall back to
      // self-relay and surface a clear inline note. The user still gets a
      // working submit path; only the privacy benefit (no EVM-side
      // sender footprint) is degraded.
      void signedTx
      if (!selfRelay) {
        throw new Error(
          "Real broadcaster selected, but encrypted-transact path is not wired (no @railgun-community/wallet). Pass selfRelay() to recover.",
        )
      }
      // eslint-disable-next-line no-console
      console.warn(
        "[BroadcasterProvider] encrypted-transact path not wired; falling back to self-relay (broadcaster=%s)",
        selected.railgunAddress,
      )
      const txHash = await selfRelay()
      return { txHash, viaBroadcaster: false }
    },
    [selected],
  )

  const value = useMemo<BroadcasterContextValue>(
    () => ({
      broadcasters,
      selected,
      selectBroadcaster,
      refresh,
      status,
      broadcastTransaction,
      isMock,
      fallbackReason,
    }),
    [
      broadcasters,
      selected,
      selectBroadcaster,
      refresh,
      status,
      broadcastTransaction,
      isMock,
      fallbackReason,
    ],
  )

  return (
    <BroadcasterContext.Provider value={value}>
      {children}
    </BroadcasterContext.Provider>
  )
}

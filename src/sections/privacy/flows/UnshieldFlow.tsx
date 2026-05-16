// Phase 5c — Unshield flow real wiring.
//
// What this ships:
//   - shielded-balance asset picker (defaults to ETH precompile,
//     0x0000000000000000000000000000000100000014, asset 20 — see
//     project_hydration_evm_assets memory for the big-endian encoding)
//   - amount input locked to the full shielded balance (v1 limitation from
//     Phase 0: partial unshields would need a 2nd "change" output and add a
//     non-trivial branch in the bundle builder — see
//     hydration-railgun-poc/contract/cli.ts cmdUnshield())
//   - Max button (auto-fills the full balance)
//   - destination selector with three modes:
//       * My EVM address    — connected EVM wallet's H160 directly
//       * My substrate addr — same H160 mapped through Hydration's
//         ExtendedAddressMapping (ETH\0 || h160 || 8 zero bytes → SS58).
//         Presentation only — the on-chain `UnshieldNote.toAddress` is still
//         the EVM 20-byte address; the substrate option just relabels it.
//       * Other address     — free-form EVM address input
//   - BroadcasterPicker (self-relay default, mock broadcasters list for
//     Phase 5d UI; broadcaster transport throws "not wired yet" if picked)
//   - Unshield CTA — re-enabled now that artifacts + snarkjs Groth16 are
//     installed in the engine (commits ba09a90 + 0360b3b). Drives the full
//     pipeline:
//         TransactionBatch.addUnshieldData({ toAddress, value, tokenData })
//       → batch.generateTransactions(prover, wallet, V2, key, progress, false)
//       → RailgunVersionedSmartContracts.generateTransact(V2, chain, [proved])
//       → user's connected EVM wallet signs + sends with gasLimit 3_000_000n
//
// Reference: hydration-railgun-poc/contract/cli.ts → cmdUnshield, and
// hydration-railgun-poc/contract/tasks/wallet.ts → wallet:unshield. Same
// shape — 1 input, 1 unshield output, UnshieldType.NORMAL. The ethers v5
// helper stack from Phase 0 is replaced by the engine's higher-level
// addUnshieldData() helper which produces a SpendingSolutionGroup with
// unshieldValue set; the prover gates on that to flip the on-chain
// UnshieldType.NONE → NORMAL.

import { useEffect, useMemo, useState } from "react"
import {
  RailgunEngine,
  RailgunVersionedSmartContracts,
  TXIDVersion,
  TokenBalances,
  TransactionBatch,
  WalletBalanceBucket,
  getTokenDataERC20,
} from "@railgun-community/engine"
import { BrowserProvider, Eip1193Provider } from "ethers6"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  RAILGUN_ENCRYPTION_KEY,
  RailgunWalletState,
  useRailgunWallet,
} from "sections/privacy/hooks/useRailgunWallet"
import { useEvmAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { H160, isEvmWalletExtension } from "utils/evm"
import { BroadcasterPicker } from "sections/privacy/components/BroadcasterPicker"
import { useBroadcasters } from "sections/privacy/hooks/useBroadcasters"
import { useBroadcastTransaction } from "sections/privacy/hooks/useBroadcastTransaction"

// Hydration ETH precompile (asset 20). Big-endian encoding — see
// project_hydration_evm_assets memory. The `1` at byte 15 is the
// "registered-asset" marker baked into Hydration's ERC20 precompile router.
const ETH_PRECOMPILE = "0x0000000000000000000000000000000100000014" as const

// All txs against RAILGUN on Hydration use this floor — eth_estimateGas
// false-reverts on precompile-touching calls (project_hydration_evm_quirks).
const UNSHIELD_GAS_LIMIT = 3_000_000n

type Asset = {
  id: number
  symbol: string
  decimals: number
  address: `0x${string}`
}

const UNSHIELDABLE_ASSETS: Asset[] = [
  { id: 20, symbol: "ETH", decimals: 18, address: ETH_PRECOMPILE },
]

type Destination =
  | { kind: "evm-self" }
  | { kind: "substrate-self" }
  | { kind: "other"; address: string }

type UnshieldState =
  | { status: "idle" }
  | { status: "proving"; progress: number; message: string }
  | { status: "broadcasting"; txHash?: string }
  | { status: "confirmed"; txHash: string }
  | { status: "error"; error: Error }

export const UnshieldFlow = () => {
  const { state, chain } = useRailgunContext()
  const engine = state.status === "ready" ? state.engine : null
  const wallet = useRailgunWallet({ engine })
  const { account } = useEvmAccount()
  const { wallet: connectedWallet } = useWallet()
  const { selected: selectedBroadcaster } = useBroadcasters()
  const broadcastTransaction = useBroadcastTransaction()

  const evmAddress = account?.address ?? ""
  const extension = connectedWallet?.extension

  const [asset, setAsset] = useState<Asset>(UNSHIELDABLE_ASSETS[0])
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState<Destination>({
    kind: "evm-self",
  })
  const [send, setSend] = useState<UnshieldState>({ status: "idle" })

  const balance = useShieldedBalance({
    engine,
    walletId: wallet.status === "ready" ? wallet.walletId : null,
    chain,
    asset,
  })

  const substrateSelf = useMemo(() => {
    if (!evmAddress) return ""
    try {
      return new H160(evmAddress).toAccount()
    } catch {
      return ""
    }
  }, [evmAddress])

  const resolvedTo = resolveDestination(destination, evmAddress)
  const balanceStr = balance.value != null ? balance.value.toString() : "—"
  const amountWei = useMemo(() => parseRaw(amount), [amount])
  const isFullBalance =
    balance.value != null &&
    amountWei !== null &&
    amountWei === balance.value &&
    balance.value > 0n

  const cta = describeCta({
    walletReady: wallet.status === "ready",
    engineReady: engine !== null,
    balance: balance.value,
    amountWei,
    isFullBalance,
    resolvedTo,
    asset,
    extensionOk: !!extension && isEvmWalletExtension(extension),
    send,
  })

  const onUnshield = async () => {
    if (!engine) return
    if (wallet.status !== "ready") return
    if (amountWei === null || amountWei <= 0n) return
    if (!isFullBalance) return
    if (!resolvedTo) return
    if (!extension || !isEvmWalletExtension(extension)) return

    setSend({
      status: "proving",
      progress: 0,
      message: "Building transaction…",
    })

    try {
      const railgunWallet = engine.wallets[wallet.walletId]
      if (!railgunWallet) {
        throw new Error(
          `RAILGUN wallet ${wallet.walletId} not loaded in the engine. Reload /privacy and re-sign.`,
        )
      }

      const tokenData = getTokenDataERC20(asset.address)

      // 1 input → 1 unshield note, no change output (v1 full-balance only).
      // Mirrors hydration-railgun-poc/contract/tasks/wallet.ts:wallet:unshield.
      const batch = new TransactionBatch(chain)
      batch.addUnshieldData({
        toAddress: resolvedTo,
        value: amountWei,
        tokenData,
      })

      const { provedTransactions } = await batch.generateTransactions(
        engine.prover,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        railgunWallet as any,
        TXIDVersion.V2_PoseidonMerkle,
        RAILGUN_ENCRYPTION_KEY,
        (progress, message) => {
          setSend({ status: "proving", progress, message })
        },
        false, // shouldGeneratePreTransactionPOIs — POI is bypassed on Hydration
      )

      setSend({ status: "broadcasting" })

      const populated = await RailgunVersionedSmartContracts.generateTransact(
        TXIDVersion.V2_PoseidonMerkle,
        chain,
        provedTransactions,
      )

      // Self-relay path: sign + send through the user's connected EVM wallet.
      // Broadcaster path: hand the populated tx data off to the
      // BroadcasterContext, which (Phase 5d) throws a "transport not wired"
      // error until @railgun-community/waku-broadcaster-client is available.
      const provider = new BrowserProvider(
        extension as unknown as Eip1193Provider,
      )
      const signer = await provider.getSigner()

      const selfRelay = async (): Promise<string> => {
        const tx = await signer.sendTransaction({
          to: populated.to,
          data: populated.data,
          value: populated.value ?? 0n,
          gasLimit: UNSHIELD_GAS_LIMIT,
        })
        setSend({ status: "broadcasting", txHash: tx.hash })
        const receipt = await tx.wait()
        if (!receipt) throw new Error("Transaction receipt missing")
        return tx.hash
      }

      const txHash = selectedBroadcaster
        ? await broadcastTransaction({
            // We don't have a wire-format signed tx here — the broadcaster
            // transport is a stub until 5d. Pass the populated payload as a
            // sentinel; the stub will throw before it inspects this.
            signedTx: populated.data ?? "",
            selfRelay,
          })
        : await selfRelay()

      setSend({ status: "confirmed", txHash })

      // Nudge the engine to pick up the spent commitment in the next pass.
      engine
        .scanContractHistory(chain, [wallet.walletId])
        // eslint-disable-next-line no-console
        .catch((e) => console.warn("[UnshieldFlow] post-unshield rescan:", e))
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      // eslint-disable-next-line no-console
      console.error("[UnshieldFlow] unshield failed:", err)
      setSend({ status: "error", error: err })
    }
  }

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 480,
        margin: "0 auto",
        color: "white",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 4 }}>Unshield to public address</h1>
      <p style={{ marginBottom: 24, opacity: 0.7, fontSize: 13 }}>
        Move tokens out of your shielded balance to a public EVM address.
      </p>

      <Card>
        <Field label="Asset">
          <select
            value={asset.id}
            onChange={(e) => {
              const next = UNSHIELDABLE_ASSETS.find(
                (a) => a.id === Number(e.target.value),
              )
              if (next) {
                setAsset(next)
                setAmount("")
              }
            }}
            style={inputStyle}
          >
            {UNSHIELDABLE_ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol} (asset {a.id})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Precompile" mono>
          {asset.address}
        </Field>

        <Field label={`Shielded balance (${asset.symbol}, raw)`} mono>
          {wallet.status !== "ready"
            ? "Sign in to RAILGUN to load balances"
            : balance.error
              ? balance.error
              : balance.value == null
                ? "Loading…"
                : balanceStr}
        </Field>

        <Field label="Amount">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              inputMode="decimal"
              placeholder={`0 (raw ${asset.symbol})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              style={maxBtnStyle}
              disabled={balance.value == null}
              onClick={() => {
                if (balance.value != null) setAmount(balance.value.toString())
              }}
            >
              Max
            </button>
          </div>
          <p style={hintStyle}>
            v1 limitation: full-balance unshield only. Partial unshield needs
            a 2nd change output and lands later.
          </p>
        </Field>

        <Field label="Send to">
          <DestinationPicker
            value={destination}
            onChange={setDestination}
            evmAddress={evmAddress}
            substrateSelf={substrateSelf}
          />
        </Field>

        <div style={{ marginBottom: 12 }}>
          <BroadcasterPicker compact />
        </div>

        <Summary
          asset={asset}
          amount={amount}
          to={resolvedTo}
          balance={balance.value}
          isFullBalance={isFullBalance}
          selectedBroadcasterLabel={
            selectedBroadcaster ? selectedBroadcaster.identifier : "Self-relay"
          }
        />

        <div style={{ display: "flex", marginTop: 16 }}>
          <button
            style={cta.disabled ? pendingBtnStyle : primaryBtnStyle}
            disabled={cta.disabled}
            onClick={onUnshield}
          >
            {cta.label}
          </button>
        </div>

        <UnshieldStatus send={send} />
      </Card>
    </div>
  )
}

// ---------- destination ----------

const DestinationPicker = ({
  value,
  onChange,
  evmAddress,
  substrateSelf,
}: {
  value: Destination
  onChange: (d: Destination) => void
  evmAddress: string
  substrateSelf: string
}) => {
  const truncate = (s: string, head = 6, tail = 4) =>
    s && s.length > head + tail + 1 ? `${s.slice(0, head)}…${s.slice(-tail)}` : s

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <RadioRow
        checked={value.kind === "evm-self"}
        onSelect={() => onChange({ kind: "evm-self" })}
        label="My EVM address"
        detail={evmAddress ? truncate(evmAddress) : "Connect EVM wallet first"}
        mono
      />
      <RadioRow
        checked={value.kind === "substrate-self"}
        onSelect={() => onChange({ kind: "substrate-self" })}
        label="My substrate addr"
        detail={
          substrateSelf
            ? truncate(substrateSelf, 4, 6)
            : "Connect EVM wallet first"
        }
        mono
      />
      <RadioRow
        checked={value.kind === "other"}
        onSelect={() =>
          onChange({
            kind: "other",
            address: value.kind === "other" ? value.address : "",
          })
        }
        label="Other address"
      />
      {value.kind === "other" && (
        <input
          type="text"
          placeholder="0x…"
          value={value.address}
          onChange={(e) => onChange({ kind: "other", address: e.target.value })}
          style={{ ...inputStyle, marginTop: 4 }}
        />
      )}
      {value.kind === "substrate-self" && (
        <p style={hintStyle}>
          The on-chain unshield destination is still the EVM 20-byte address.
          Hydration maps this substrate form back to the same H160 via
          ExtendedAddressMapping — the substrate label is for display only.
        </p>
      )}
    </div>
  )
}

const RadioRow = ({
  checked,
  onSelect,
  label,
  detail,
  mono,
}: {
  checked: boolean
  onSelect: () => void
  label: string
  detail?: string
  mono?: boolean
}) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      cursor: "pointer",
      padding: "6px 0",
    }}
  >
    <input
      type="radio"
      checked={checked}
      onChange={onSelect}
      style={{ accentColor: "white" }}
    />
    <span style={{ flex: 1 }}>{label}</span>
    {detail && (
      <span
        style={{
          opacity: 0.65,
          fontSize: 12,
          ...(mono ? monoStyle : undefined),
        }}
      >
        {detail}
      </span>
    )}
  </label>
)

// ---------- summary ----------

const Summary = ({
  asset,
  amount,
  to,
  balance,
  isFullBalance,
  selectedBroadcasterLabel,
}: {
  asset: Asset
  amount: string
  to: string
  balance: bigint | null
  isFullBalance: boolean
  selectedBroadcasterLabel: string
}) => (
  <div
    style={{
      marginTop: 12,
      padding: 12,
      background: "rgba(0,0,0,0.25)",
      borderRadius: 6,
      fontSize: 12,
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      rowGap: 6,
      columnGap: 8,
    }}
  >
    <span style={{ opacity: 0.6 }}>Sending</span>
    <span style={monoStyle}>
      {amount || "0"} raw {asset.symbol}
    </span>
    <span style={{ opacity: 0.6 }}>To (EVM)</span>
    <span style={monoStyle}>{to || "—"}</span>
    <span style={{ opacity: 0.6 }}>Mode</span>
    <span>{selectedBroadcasterLabel}</span>
    <span style={{ opacity: 0.6 }}>Balance</span>
    <span style={monoStyle}>{balance != null ? balance.toString() : "—"}</span>
    <span style={{ opacity: 0.6 }}>Full balance?</span>
    <span style={{ color: isFullBalance ? "#7d7" : "#f88" }}>
      {isFullBalance ? "yes" : "no (required in v1)"}
    </span>
  </div>
)

const UnshieldStatus = ({ send }: { send: UnshieldState }) => {
  if (send.status === "idle") return null
  if (send.status === "proving") {
    const pct = Math.round(send.progress * 100)
    return (
      <p style={{ ...hintStyle, marginTop: 12 }}>
        Generating proof… {pct}% — {send.message}
      </p>
    )
  }
  if (send.status === "broadcasting") {
    return (
      <p style={{ ...hintStyle, marginTop: 12 }}>
        Broadcasting{send.txHash ? ` ${truncateMiddle(send.txHash, 10, 8)}` : ""}…
      </p>
    )
  }
  if (send.status === "confirmed") {
    return (
      <p style={{ ...hintStyle, marginTop: 12, color: "#7d7" }}>
        Confirmed ✓ {truncateMiddle(send.txHash, 10, 8)}
      </p>
    )
  }
  return (
    <pre
      style={{
        marginTop: 12,
        padding: 12,
        background: "rgba(0,0,0,0.3)",
        borderRadius: 4,
        fontSize: 11,
        whiteSpace: "pre-wrap",
        color: "#f88",
      }}
    >
      {send.error.message}
    </pre>
  )
}

// ---------- shielded-balance reader (mirrors PrivacyPage's poller) ----------

const useShieldedBalance = ({
  engine,
  walletId,
  chain,
  asset,
}: {
  engine: RailgunEngine | null
  walletId: string | null
  chain: { type: 0; id: number }
  asset: Asset
}): { value: bigint | null; error: string | null } => {
  const [balances, setBalances] = useState<TokenBalances | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!engine || !walletId) {
      setBalances(null)
      setError(null)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const w = engine.wallets[walletId]
        if (!w) return
        const byBucket = await w.getTokenBalancesByBucket(
          TXIDVersion.V2_PoseidonMerkle,
          chain,
        )
        if (cancelled) return
        setBalances(byBucket[WalletBalanceBucket.Spendable] ?? {})
        setError(null)
      } catch (e) {
        if (cancelled) return
        setError(e instanceof Error ? e.message : String(e))
      }
    }
    load()
    const id = window.setInterval(load, 5000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [engine, walletId, chain])

  if (!walletId) return { value: null, error: null }
  if (error) return { value: null, error }
  if (!balances) return { value: null, error: null }

  // Match by ERC20 token address. The engine keys TokenBalances by the
  // poseidon hash of (tokenType || token || subId), so we have to scan and
  // compare the underlying tokenData.tokenAddress. For Phase 5c there's
  // only one asset; that's why we resolve by exact-match on the address.
  const lower = asset.address.toLowerCase()
  for (const entry of Object.values(balances)) {
    if (entry.tokenData.tokenAddress.toLowerCase() === lower) {
      return { value: entry.balance, error: null }
    }
  }
  return { value: 0n, error: null }
}

// ---------- helpers ----------

const resolveDestination = (d: Destination, evmAddress: string): string => {
  switch (d.kind) {
    case "evm-self":
      return evmAddress
    case "substrate-self":
      // Underlying UnshieldNote always carries the H160. The substrate option
      // is a label — see header comment.
      return evmAddress
    case "other":
      return d.address.trim()
  }
}

const parseRaw = (input: string): bigint | null => {
  const t = input.trim()
  if (!t) return null
  if (!/^\d+$/.test(t)) return null
  try {
    return BigInt(t)
  } catch {
    return null
  }
}

const describeCta = ({
  walletReady,
  engineReady,
  balance,
  amountWei,
  isFullBalance,
  resolvedTo,
  asset,
  extensionOk,
  send,
}: {
  walletReady: boolean
  engineReady: boolean
  balance: bigint | null
  amountWei: bigint | null
  isFullBalance: boolean
  resolvedTo: string
  asset: Asset
  extensionOk: boolean
  send: UnshieldState
}): { label: string; disabled: boolean } => {
  if (send.status === "proving") return { label: "Generating proof…", disabled: true }
  if (send.status === "broadcasting") return { label: "Broadcasting…", disabled: true }
  if (send.status === "confirmed") return { label: "Unshielded ✓", disabled: true }
  if (!engineReady) return { label: "Engine booting…", disabled: true }
  if (!walletReady) return { label: "Sign in to RAILGUN first", disabled: true }
  if (balance == null) return { label: "Loading balance…", disabled: true }
  if (balance === 0n) return { label: "No shielded balance", disabled: true }
  if (amountWei === null || amountWei <= 0n) return { label: "Enter amount", disabled: true }
  if (!isFullBalance) return { label: "Use Max (full balance only)", disabled: true }
  if (!resolvedTo) return { label: "Enter destination", disabled: true }
  if (!extensionOk) return { label: "Connect EVM wallet", disabled: true }
  return {
    label: `Unshield ${amountWei.toString()} raw ${asset.symbol}`,
    disabled: false,
  }
}

const truncateMiddle = (s: string, head: number, tail: number): string => {
  if (s.length <= head + tail + 1) return s
  return `${s.slice(0, head)}…${s.slice(-tail)}`
}

// ---------- presentation primitives (mirrors ShieldFlow) ----------

const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 20,
      background: "rgba(255,255,255,0.04)",
      borderRadius: 8,
      border: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    {children}
  </div>
)

const Field = ({
  label,
  children,
  mono,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ opacity: 0.6, fontSize: 12, marginBottom: 4 }}>{label}</div>
    <div style={mono ? monoStyle : undefined}>{children}</div>
  </div>
)

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  background: "rgba(0,0,0,0.3)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  fontSize: 14,
}

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 12,
  wordBreak: "break-all",
}

const hintStyle: React.CSSProperties = {
  marginTop: 4,
  fontSize: 11,
  opacity: 0.55,
}

const pendingBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.5)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "not-allowed",
}

const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
}

const maxBtnStyle: React.CSSProperties = {
  padding: "10px 14px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
}

// Silence unused-import warning until the wallet object is consumed by the
// proof-generation path. The wallet is consumed through useRailgunWallet's
// RailgunWalletState — re-exported so the privacy section index can pick it
// up without introducing an extra barrel.
export type _UnshieldWalletState = RailgunWalletState

// Phase 5c — Unshield flow UI scaffold.
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
//   - gas-payment selector pinned to "self-relay" (broadcaster integration
//     is a separate track; Phase 5c v1 is broadcaster-less)
//   - Unshield CTA (disabled until proof artifacts + signer bridge land —
//     same blocker as ShieldFlow; see header comment there)
//
// What this does NOT ship yet:
//   - real shielded-balance query plumbed into the picker (today the picker
//     shows the static asset list; balance read happens once the asset is
//     selected via `wallet.getTokenBalancesByBucket(...)`)
//   - real `TransactionBatch` → `prover.prove` → `RailgunSmartWalletContract
//     .generateTransact` → EVM-wallet broadcast pipeline. Wiring needs:
//       * proof artifacts (engine boots with stubArtifactGetter that throws;
//         see sections/privacy/utils/engine.ts header)
//       * viem↔ethers v6 signer adapter for the broadcast step
//   - broadcaster path (UI says "self-relay" only)
//
// Reference: /home/mrq/git/hydration-railgun-poc/contract/cli.ts cmdUnshield
// (ethers v5, full balance only, gasLimit 2_000_000). The Phase 5 plan
// bumps gasLimit to 3_000_000n once the call goes through the proxy on
// Frontier; eth_estimateGas false-reverts on this path so the limit has to
// be explicit (see project_hydration_evm_quirks memory).

import { useEffect, useMemo, useState } from "react"
import {
  RailgunEngine,
  TXIDVersion,
  TokenBalances,
  WalletBalanceBucket,
} from "@railgun-community/engine"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  RailgunWalletState,
  useRailgunWallet,
} from "sections/privacy/hooks/useRailgunWallet"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { H160 } from "utils/evm"

// Hydration ETH precompile (asset 20). Big-endian encoding — see
// project_hydration_evm_assets memory. The `1` at byte 15 is the
// "registered-asset" marker baked into Hydration's ERC20 precompile router.
const ETH_PRECOMPILE = "0x0000000000000000000000000000000100000014" as const

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

type GasMode = "broadcaster" | "self-relay"

export const UnshieldFlow = () => {
  const { state, chain } = useRailgunContext()
  const engine = state.status === "ready" ? state.engine : null
  const wallet = useRailgunWallet({ engine })
  const { account } = useEvmAccount()

  const evmAddress = account?.address ?? ""

  const [asset, setAsset] = useState<Asset>(UNSHIELDABLE_ASSETS[0])
  const [amount, setAmount] = useState("")
  const [destination, setDestination] = useState<Destination>({
    kind: "evm-self",
  })
  // Broadcaster integration is a separate track. v1 = self-relay only.
  const gasMode: GasMode = "self-relay"

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
  const isFullBalance =
    balance.value != null && amount !== "" && amount === balance.value.toString()

  const cta = describeCta({
    walletReady: wallet.status === "ready",
    balance: balance.value,
    amount,
    isFullBalance,
    resolvedTo,
    asset,
  })

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

        <Field label="Pay gas with">
          <GasModePicker value={gasMode} />
        </Field>

        <Summary
          asset={asset}
          amount={amount}
          to={resolvedTo}
          balance={balance.value}
          isFullBalance={isFullBalance}
        />

        <div style={{ display: "flex", marginTop: 16 }}>
          <button style={cta.disabled ? pendingBtnStyle : primaryBtnStyle} disabled>
            {cta.label}
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.55 }}>
          Button disabled — same blocker as ShieldFlow: proof artifacts and
          the viem↔ethers v6 signer bridge are not wired yet. Once the
          prover can run, the call is `RailgunSmartWalletContract
          .generateTransact([provedTx])` with explicit{" "}
          <code style={codeStyle}>gasLimit: 3_000_000n</code>.
        </p>
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

// ---------- gas mode ----------

const GasModePicker = ({ value }: { value: GasMode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <RadioRow
      checked={false}
      onSelect={() => undefined}
      label="Broadcaster"
      detail="Not available in Phase 5c"
    />
    <RadioRow
      checked={value === "self-relay"}
      onSelect={() => undefined}
      label="Self-relay"
      detail="You pay gas from the connected EVM wallet"
    />
  </div>
)

// ---------- summary ----------

const Summary = ({
  asset,
  amount,
  to,
  balance,
  isFullBalance,
}: {
  asset: Asset
  amount: string
  to: string
  balance: bigint | null
  isFullBalance: boolean
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
    <span>Self-relay (you pay gas)</span>
    <span style={{ opacity: 0.6 }}>Balance</span>
    <span style={monoStyle}>{balance != null ? balance.toString() : "—"}</span>
    <span style={{ opacity: 0.6 }}>Full balance?</span>
    <span style={{ color: isFullBalance ? "#7d7" : "#f88" }}>
      {isFullBalance ? "yes" : "no (required in v1)"}
    </span>
  </div>
)

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

const describeCta = ({
  walletReady,
  balance,
  amount,
  isFullBalance,
  resolvedTo,
  asset,
}: {
  walletReady: boolean
  balance: bigint | null
  amount: string
  isFullBalance: boolean
  resolvedTo: string
  asset: Asset
}): { label: string; disabled: true } => {
  // Always disabled in 5c — see footer note in the component. The label
  // still reflects the next blocker so the UI explains itself.
  if (!walletReady) return { label: "Sign in to RAILGUN first", disabled: true }
  if (balance == null) return { label: "Loading balance…", disabled: true }
  if (balance === 0n) return { label: "No shielded balance", disabled: true }
  if (!amount) return { label: "Enter amount", disabled: true }
  if (!isFullBalance) return { label: "Use Max (full balance only)", disabled: true }
  if (!resolvedTo) return { label: "Enter destination", disabled: true }
  return { label: `Unshield ${amount} raw ${asset.symbol}`, disabled: true }
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

const codeStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 11,
  background: "rgba(0,0,0,0.3)",
  padding: "1px 4px",
  borderRadius: 3,
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
// proof-generation path. Phase 5c v1 only renders state; the wallet is
// already plumbed in via useRailgunWallet -> RailgunWalletState.
export type _UnshieldWalletState = RailgunWalletState

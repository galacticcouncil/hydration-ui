// Phase 5b — Privacy landing page wired to the booted engine + wallet hook.
//
// Surfaces:
//   - engine boot status
//   - UTXO merkletree scan progress
//   - "Sign in to RAILGUN" CTA (mints/loads the shielded wallet)
//   - 0zk address + shielded balances once a wallet exists
//
// Visual is intentionally plain HTML — the polished modal-on-route UX from the
// Phase 5 plan lands once the engine plumbing is stable.

import { useEffect, useState } from "react"
import {
  TXIDVersion,
  TokenBalances,
  WalletBalanceBucket,
} from "@railgun-community/engine"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  RailgunWalletState,
  useRailgunWallet,
} from "sections/privacy/hooks/useRailgunWallet"

export const PrivacyPage = () => {
  const { state, scan, chain, config } = useRailgunContext()
  const engine = state.status === "ready" ? state.engine : null
  const wallet = useRailgunWallet({ engine })

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 720,
        margin: "0 auto",
        color: "white",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 12 }}>Privacy</h1>
      <p style={{ marginBottom: 24, opacity: 0.7 }}>
        Shielded balances powered by RAILGUN. Phase 5b — engine boot + signed
        wallet. Shield/Send/Unshield/Swap flows ship in 5c.
      </p>

      <Card>
        <Row label="Status">
          <StatusDot status={state.status} />
          <strong>{describeStatus(state)}</strong>
        </Row>
        <Row label="Network">{config.label}</Row>
        <Row label="Chain ID">{config.chainId}</Row>
        <Row label="Proxy" mono>
          {config.proxy}
        </Row>
        <Row label="RPC" mono>
          {config.rpcUrl}
        </Row>
        <Row label="Scan">
          <ScanIndicator scan={scan} />
        </Row>
        {state.status === "error" && (
          <pre style={errorStyle}>{state.error.message}</pre>
        )}
      </Card>

      <div style={{ height: 16 }} />

      <Card>
        <h2 style={{ marginTop: 0 }}>Shielded wallet</h2>
        <WalletPanel wallet={wallet} />
        {wallet.status === "ready" && engine && (
          <ShieldedBalances
            engine={engine}
            walletId={wallet.walletId}
            chain={chain}
          />
        )}
      </Card>
    </div>
  )
}

const describeStatus = (state: ReturnType<typeof useRailgunContext>["state"]) => {
  switch (state.status) {
    case "idle":
      return "Idle"
    case "booting":
      return "Booting engine…"
    case "ready":
      return "Engine ready"
    case "error":
      return "Engine failed"
  }
}

const WalletPanel = ({ wallet }: { wallet: RailgunWalletState }) => {
  switch (wallet.status) {
    case "no-account":
      return <p style={{ opacity: 0.7 }}>Connect an EVM wallet to continue.</p>
    case "ready-to-sign":
      return (
        <div>
          <p style={{ opacity: 0.7 }}>
            Sign a one-shot message to derive your shielded wallet. The
            signature never leaves your browser.
          </p>
          <button style={primaryBtnStyle} onClick={() => wallet.sign()}>
            Sign in to RAILGUN
          </button>
        </div>
      )
    case "signing":
      return <p style={{ opacity: 0.7 }}>Waiting for wallet signature…</p>
    case "creating-wallet":
      return <p style={{ opacity: 0.7 }}>Deriving shielded wallet…</p>
    case "ready":
      return (
        <div>
          <Row label="0zk address" mono>
            {wallet.railgunAddress}
          </Row>
          <Row label="Wallet ID" mono>
            {wallet.walletId}
          </Row>
        </div>
      )
    case "error":
      return (
        <div>
          <pre style={errorStyle}>{wallet.error.message}</pre>
          <button style={primaryBtnStyle} onClick={() => wallet.retry()}>
            Retry
          </button>
        </div>
      )
  }
}

const ShieldedBalances = ({
  engine,
  walletId,
  chain,
}: {
  engine: import("@railgun-community/engine").RailgunEngine
  walletId: string
  chain: { type: 0; id: number }
}) => {
  const [balances, setBalances] = useState<TokenBalances | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const wallet = engine.wallets[walletId]
        if (!wallet) return
        const byBucket = await wallet.getTokenBalancesByBucket(
          TXIDVersion.V2_PoseidonMerkle,
          chain,
        )
        if (cancelled) return
        setBalances(byBucket[WalletBalanceBucket.Spendable] ?? {})
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

  if (error) return <pre style={errorStyle}>{error}</pre>
  if (!balances) return <p style={{ opacity: 0.7 }}>Loading balances…</p>

  const entries = Object.entries(balances)
  if (entries.length === 0) {
    return (
      <p style={{ opacity: 0.7 }}>
        No shielded balances yet. Shield flow ships in Phase 5c.
      </p>
    )
  }

  return (
    <div style={{ marginTop: 12 }}>
      {entries.map(([tokenHash, tree]) => (
        <Row key={tokenHash} label={`token ${tokenHash.slice(0, 10)}…`} mono>
          {tree.balance.toString()}
        </Row>
      ))}
    </div>
  )
}

const ScanIndicator = ({
  scan,
}: {
  scan: ReturnType<typeof useRailgunContext>["scan"]
}) => {
  const pct = Math.round(scan.progress * 100)
  return (
    <span>
      {scan.status} {pct > 0 && `· ${pct}%`}
    </span>
  )
}

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

const Row = ({
  label,
  children,
  mono,
}: {
  label: string
  children: React.ReactNode
  mono?: boolean
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "120px 1fr",
      gap: 8,
      alignItems: "center",
      marginBottom: 8,
    }}
  >
    <span style={{ opacity: 0.6 }}>{label}</span>
    <span style={mono ? monoStyle : undefined}>{children}</span>
  </div>
)

const StatusDot = ({ status }: { status: string }) => {
  const color =
    status === "ready"
      ? "#0a0"
      : status === "error"
        ? "#c00"
        : status === "booting"
          ? "#fa0"
          : "#888"
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        display: "inline-block",
        background: color,
        marginRight: 8,
      }}
    />
  )
}

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 12,
  wordBreak: "break-all",
}

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  background: "rgba(0,0,0,0.3)",
  borderRadius: 4,
  fontSize: 11,
  whiteSpace: "pre-wrap",
  color: "#f88",
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

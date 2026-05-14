// Phase 5c — Shield flow UI scaffold.
//
// What this ships:
//   - asset picker stub (defaults to "ETH precompile" — Hydration asset 20,
//     EVM address 0x0000…0000000014; see project_hydration_evm_assets memory)
//   - amount input
//   - Approve + Shield buttons (disabled until full transaction wiring lands)
//
// What this does NOT ship yet:
//   - real ERC-20 allowance check / approve tx
//   - real `engine.populateShield` / `RailgunSmartWalletContract.shield` call
//
// Wiring those needs:
//   - viem<->ethers v6 signer adapter (or convert this flow to ethers v6
//     entirely and grab the JsonRpcSigner from the user's EVM wallet)
//   - shield-private-key signature flow (engine.note.ShieldNote
//     .getShieldPrivateKeySignatureMessage → personal_sign → bytes)
//   - ShieldNoteERC20.serialize → submit to railgunSmartWalletContract.shield
//
// Reference: /home/mrq/git/hydration-railgun-poc/contract/cli.ts cmdShield()
// — same proxy, same chain, ethers v5 helpers stack. Mirror its flow when
// porting to engine APIs.

import { useState } from "react"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  RailgunWalletState,
  useRailgunWallet,
} from "sections/privacy/hooks/useRailgunWallet"

// Hydration ETH precompile (asset 20). See project_hydration_evm_assets:
// asset id → big-endian bytes despite Rust calling to_le_bytes. ID 20 (0x14)
// lands at 0x...0000000014.
const ETH_PRECOMPILE = "0x0000000000000000000000000000000000000014" as const

type Asset = {
  id: number
  symbol: string
  decimals: number
  address: `0x${string}`
}

const SHIELDABLE_ASSETS: Asset[] = [
  { id: 20, symbol: "ETH", decimals: 18, address: ETH_PRECOMPILE },
]

export const ShieldFlow = () => {
  const { state } = useRailgunContext()
  const engine = state.status === "ready" ? state.engine : null
  const wallet = useRailgunWallet({ engine })

  const [asset, setAsset] = useState<Asset>(SHIELDABLE_ASSETS[0])
  const [amount, setAmount] = useState("")

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
      <h1 style={{ marginBottom: 4 }}>Shield assets</h1>
      <p style={{ marginBottom: 24, opacity: 0.7, fontSize: 13 }}>
        Move EVM tokens into your shielded RAILGUN balance.
      </p>

      <Card>
        <Field label="Asset">
          <select
            value={asset.id}
            onChange={(e) => {
              const next = SHIELDABLE_ASSETS.find(
                (a) => a.id === Number(e.target.value),
              )
              if (next) setAsset(next)
            }}
            style={inputStyle}
          >
            {SHIELDABLE_ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol} (asset {a.id})
              </option>
            ))}
          </select>
        </Field>

        <Field label="Address" mono>
          {asset.address}
        </Field>

        <Field label="Amount">
          <input
            type="text"
            inputMode="decimal"
            placeholder={`0.0 ${asset.symbol}`}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <RecipientLine wallet={wallet} />

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button style={pendingBtnStyle} disabled>
            Approve {asset.symbol}
          </button>
          <button style={pendingBtnStyle} disabled>
            Shield {amount || "0"} {asset.symbol}
          </button>
        </div>

        <p style={{ marginTop: 16, fontSize: 12, opacity: 0.55 }}>
          Buttons disabled — shield transaction wiring lands once the
          viem↔ethers v6 signer bridge is in place. See ShieldFlow header
          comment for the remaining pieces.
        </p>
      </Card>
    </div>
  )
}

const RecipientLine = ({ wallet }: { wallet: RailgunWalletState }) => {
  if (wallet.status !== "ready") {
    return (
      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>
        Sign in to RAILGUN on the /privacy page first to set a recipient
        address.
      </p>
    )
  }
  return (
    <Field label="To (0zk)" mono>
      {wallet.railgunAddress}
    </Field>
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

const pendingBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "rgba(255,255,255,0.1)",
  color: "rgba(255,255,255,0.5)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "not-allowed",
}

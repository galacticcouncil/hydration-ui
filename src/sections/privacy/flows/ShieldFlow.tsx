// Phase 5c — Shield flow real wiring.
//
// What this ships:
//   - asset picker (locked to ETH precompile / Hydration asset 20 for v1)
//   - amount input (18 decimals)
//   - Approve button (only shown when allowance < amount)
//   - Shield button — builds a ShieldNoteERC20 against the user's RAILGUN
//     wallet, serializes via `engine.note.serialize`, and submits via
//     `RailgunVersionedSmartContracts.generateShield`. We extract `to`/`data`
//     from the populated tx and call `signer.sendTransaction` with an explicit
//     gasLimit override (Hydration EVM false-reverts eth_estimateGas on
//     precompile calls — see project_hydration_evm_quirks).
//
// Constraints (Phase 0 lark):
//   - approve cap: 2^120, NOT MaxUint256 ("value too big for type u128")
//   - explicit gasLimit: 2_000_000 on every tx
//   - shieldPrivateKey: sign "RAILGUN_SHIELD" via the EVM wallet → sha256(sig)
//
// Reference: /home/mrq/git/hydration-railgun-poc/contract/cli.ts cmdShield()
// — same proxy, same chain, ethers v5 helpers stack. We mirror its flow but
// use the engine's higher-level APIs instead of replicating helpers.

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-location"
import { BrowserProvider, Contract, JsonRpcSigner } from "ethers6"
import { sha256 } from "@noble/hashes/sha2.js"
import { hexToBytes } from "@noble/hashes/utils.js"
import {
  ByteUtils,
  ChainType,
  RailgunVersionedSmartContracts,
  ShieldNote,
  ShieldNoteERC20,
  TXIDVersion,
} from "@railgun-community/engine"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  RailgunWalletState,
  useRailgunWallet,
} from "sections/privacy/hooks/useRailgunWallet"
import { useEvmAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { isEvmWalletExtension } from "utils/evm"

// Hydration ETH precompile (asset 20). See project_hydration_evm_assets:
// asset id → big-endian bytes despite Rust calling to_le_bytes. ID 20 (0x14)
// lands at 0x...0000000014. The 01 byte at offset 16 marks the ERC20-precompile
// namespace (vs. native).
const ETH_PRECOMPILE = "0x0000000000000000000000000000000100000014" as const

// Approve cap. Hydration EVM's u128-backed ERC20 layer rejects MaxUint256:
// "value too big for type u128". 2^120 fits and is effectively unlimited.
const APPROVE_CAP = 1n << 120n

// All txs against RAILGUN on Hydration use this floor — eth_estimateGas
// false-reverts on precompile calls.
const SHIELD_GAS_LIMIT = 2_000_000n
const APPROVE_GAS_LIMIT = 200_000n

const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
] as const

type Asset = {
  id: number
  symbol: string
  decimals: number
  address: `0x${string}`
}

const SHIELDABLE_ASSETS: Asset[] = [
  { id: 20, symbol: "ETH", decimals: 18, address: ETH_PRECOMPILE },
]

type FlowStatus =
  | { kind: "idle" }
  | { kind: "approving" }
  | { kind: "shielding"; phase: "sign-shield-key" | "serialize" | "submit" }
  | { kind: "confirming"; txHash: string }
  | { kind: "done"; txHash: string }
  | { kind: "error"; message: string }

export const ShieldFlow = () => {
  const navigate = useNavigate()
  const { state, chain, config } = useRailgunContext()
  const engine = state.status === "ready" ? state.engine : null
  const wallet = useRailgunWallet({ engine })
  const { account } = useEvmAccount()
  const { wallet: evmWallet } = useWallet()

  const [asset, setAsset] = useState<Asset>(SHIELDABLE_ASSETS[0])
  const [amount, setAmount] = useState("")
  const [allowance, setAllowance] = useState<bigint | null>(null)
  const [status, setStatus] = useState<FlowStatus>({ kind: "idle" })

  const evmAddress = account?.address ?? ""
  const extension = evmWallet?.extension
  const proxy = config.proxy

  // Parse amount → wei (bigint). Returns null on bad input.
  const amountWei = useMemo(() => parseAmount(amount, asset.decimals), [
    amount,
    asset.decimals,
  ])

  // Pull current allowance whenever the user/asset/proxy/status changes so we
  // know whether the Approve button needs to render. Status dep refreshes
  // after a successful approve tx.
  useEffect(() => {
    let cancelled = false
    setAllowance(null)
    if (!extension || !isEvmWalletExtension(extension) || !evmAddress) return
    ;(async () => {
      try {
        const provider = new BrowserProvider(extension)
        const erc20 = new Contract(asset.address, ERC20_ABI, provider)
        const a: bigint = await erc20.allowance(evmAddress, proxy)
        if (!cancelled) setAllowance(a)
      } catch (e) {
        if (!cancelled) {
          // eslint-disable-next-line no-console
          console.warn("[ShieldFlow] allowance read failed:", e)
          setAllowance(0n)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [asset.address, evmAddress, extension, proxy, status])

  const getSigner = async (): Promise<JsonRpcSigner> => {
    if (!extension || !isEvmWalletExtension(extension)) {
      throw new Error("EVM wallet not connected")
    }
    const provider = new BrowserProvider(extension)
    return provider.getSigner()
  }

  const onApprove = async () => {
    try {
      setStatus({ kind: "approving" })
      const signer = await getSigner()
      const erc20 = new Contract(asset.address, ERC20_ABI, signer)
      const tx = await erc20.approve(proxy, APPROVE_CAP, {
        gasLimit: APPROVE_GAS_LIMIT,
      })
      await tx.wait()
      // Re-read allowance via status change (effect dep).
      setStatus({ kind: "idle" })
    } catch (e) {
      setStatus({ kind: "error", message: errToString(e) })
    }
  }

  const onShield = async () => {
    if (!engine || wallet.status !== "ready") {
      setStatus({ kind: "error", message: "RAILGUN wallet not ready" })
      return
    }
    if (!amountWei || amountWei <= 0n) {
      setStatus({ kind: "error", message: "Enter a positive amount" })
      return
    }
    if (!extension || !isEvmWalletExtension(extension) || !evmAddress) {
      setStatus({ kind: "error", message: "EVM wallet not connected" })
      return
    }

    try {
      const railgunWallet = engine.wallets[wallet.walletId]
      if (!railgunWallet) throw new Error("RAILGUN wallet missing from engine")

      // 1. Derive shieldPrivateKey from a user signature over the constant
      //    message "RAILGUN_SHIELD". sha256(sig) → 32 bytes.
      setStatus({ kind: "shielding", phase: "sign-shield-key" })
      const shieldMessage = ShieldNote.getShieldPrivateKeySignatureMessage()
      const signatureHex = (await extension.request({
        method: "personal_sign",
        params: [shieldMessage, evmAddress],
      })) as string
      const sigBytes = hexToBytes(signatureHex.replace(/^0x/, ""))
      const shieldPrivateKey = sha256(sigBytes)

      // 2. Build + serialize the shield note. Recipient = the user's own
      //    shielded wallet (single-party self-shield; cross-wallet sends land
      //    in a later phase).
      setStatus({ kind: "shielding", phase: "serialize" })
      const random = ByteUtils.randomHex(16)
      const note = new ShieldNoteERC20(
        railgunWallet.masterPublicKey,
        random,
        amountWei,
        asset.address,
      )
      const viewingPub = railgunWallet.viewingPublicKey
      const shieldRequest = await note.serialize(shieldPrivateKey, viewingPub)

      // 3. Populate the shield() call via the engine's contract wrapper, then
      //    send through the EIP-1193 signer with an explicit gasLimit.
      setStatus({ kind: "shielding", phase: "submit" })
      const populated = await RailgunVersionedSmartContracts.generateShield(
        TXIDVersion.V2_PoseidonMerkle,
        { type: ChainType.EVM, id: chain.id },
        [shieldRequest],
      )
      const signer = await getSigner()
      const sent = await signer.sendTransaction({
        to: populated.to,
        data: populated.data,
        gasLimit: SHIELD_GAS_LIMIT,
      })
      setStatus({ kind: "confirming", txHash: sent.hash })
      await sent.wait()
      setStatus({ kind: "done", txHash: sent.hash })

      // Nudge the engine to pick up the new commitment in the next scan pass.
      engine
        .scanContractHistory({ type: ChainType.EVM, id: chain.id }, [
          wallet.walletId,
        ])
        // eslint-disable-next-line no-console
        .catch((e) => console.warn("[ShieldFlow] post-shield rescan:", e))

      // Bounce back to /privacy after a short pause so the user sees the hash.
      window.setTimeout(() => {
        navigate({ to: "/privacy" })
      }, 1500)
    } catch (e) {
      setStatus({ kind: "error", message: errToString(e) })
    }
  }

  const needsApproval =
    allowance !== null && amountWei !== null && allowance < amountWei
  const canShield =
    wallet.status === "ready" &&
    amountWei !== null &&
    amountWei > 0n &&
    !needsApproval &&
    status.kind !== "approving" &&
    status.kind !== "shielding" &&
    status.kind !== "confirming"

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
          {amount && amountWei === null && (
            <div style={{ fontSize: 11, color: "#f88", marginTop: 4 }}>
              invalid amount
            </div>
          )}
        </Field>

        <Field label="Allowance" mono>
          {allowance === null ? "…" : allowance.toString()}
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
          {needsApproval && (
            <button
              style={primaryBtnStyle}
              onClick={onApprove}
              disabled={status.kind === "approving"}
            >
              {status.kind === "approving"
                ? "Approving…"
                : `Approve ${asset.symbol}`}
            </button>
          )}
          <button
            style={canShield ? primaryBtnStyle : pendingBtnStyle}
            onClick={onShield}
            disabled={!canShield}
          >
            {shieldButtonLabel(status, asset, amount)}
          </button>
        </div>

        <StatusLine status={status} />
      </Card>
    </div>
  )
}

const shieldButtonLabel = (
  status: FlowStatus,
  asset: Asset,
  amount: string,
) => {
  if (status.kind === "shielding") {
    switch (status.phase) {
      case "sign-shield-key":
        return "Sign shield key…"
      case "serialize":
        return "Encrypting note…"
      case "submit":
        return "Awaiting wallet…"
    }
  }
  if (status.kind === "confirming") return "Confirming…"
  if (status.kind === "done") return "Shielded ✓"
  return `Shield ${amount || "0"} ${asset.symbol}`
}

const StatusLine = ({ status }: { status: FlowStatus }) => {
  if (status.kind === "idle") return null
  if (status.kind === "error") {
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
        {status.message}
      </pre>
    )
  }
  if (status.kind === "confirming" || status.kind === "done") {
    return (
      <p
        style={{
          marginTop: 12,
          fontSize: 12,
          opacity: 0.7,
          wordBreak: "break-all",
        }}
      >
        {status.kind === "done" ? "Shielded — tx" : "Confirming tx"}{" "}
        <span style={{ fontFamily: "monospace" }}>{status.txHash}</span>
      </p>
    )
  }
  return null
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

// "1.5" + 18 → 1500000000000000000n. Returns null on garbage input.
const parseAmount = (input: string, decimals: number): bigint | null => {
  if (!input.trim()) return null
  if (!/^\d*\.?\d*$/.test(input.trim())) return null
  const [whole = "0", frac = ""] = input.trim().split(".")
  if (frac.length > decimals) return null
  const padded = (frac + "0".repeat(decimals)).slice(0, decimals)
  try {
    const wei = BigInt(whole) * 10n ** BigInt(decimals) + BigInt(padded || "0")
    return wei
  } catch {
    return null
  }
}

const errToString = (e: unknown): string => {
  if (e instanceof Error) return e.message
  if (typeof e === "string") return e
  try {
    return JSON.stringify(e)
  } catch {
    return String(e)
  }
}

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

const primaryBtnStyle: React.CSSProperties = {
  padding: "10px 18px",
  background: "#fff",
  color: "#000",
  border: "none",
  borderRadius: 6,
  fontWeight: 600,
  cursor: "pointer",
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

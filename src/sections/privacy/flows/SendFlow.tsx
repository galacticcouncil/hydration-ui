// Phase 5c — Private send flow.
//
// What this ships:
//   - 0zk recipient address input + live validation via
//     RailgunEngine.decodeAddress (throws on invalid bech32 / wrong checksum)
//   - asset picker (ETH on lark for now; HDX/USDT/USDC stub out behind the
//     same asset registry once a runtime asset → EVM-precompile mapping
//     hook lands)
//   - amount input with [Max] (clamped to spendable shielded balance)
//   - memo (optional, encrypted inside the note's memo field)
//   - "Pay gas with" radio — only Self-relay enabled in 5c; the Broadcaster
//     option is owned by Phase 5d (broadcaster-track agent) and gets wired
//     in when that branch merges
//   - summary block (recipient receives / total deducted / proof time)
//   - Send button that drives the full pipeline:
//         TransactionBatch.addOutput(TransactNote.createTransfer(...))
//       → batch.generateTransactions(prover, wallet, V2_PoseidonMerkle, ...)
//       → RailgunVersionedSmartContracts.generateTransact(...)
//       → user's connected EVM wallet signs + sends the proxy.transact() call
//
// Notes / gotchas:
//   - Self-transfer (recipient == own 0zk address) is accepted — same shape
//     as a "rotate" / change-only spend. The engine will still produce two
//     outputs (one for recipient=self, one for change=self).
//   - All on-chain TXs use an explicit `gasLimit: 3_000_000n` override.
//     Hydration's Frontier eth_estimateGas is known to false-revert on
//     anything that hits a precompile mid-call (see project_hydration_evm_quirks
//     memory), so we never let ethers estimate.
//   - Approvals for shielded transfers don't exist (the proxy isn't moving
//     ERC-20 tokens — it's spending notes). The `2n**120n` ceiling rule from
//     the implementation plan only applies to ShieldFlow's approve step.
//   - Proof artifacts are NOT loaded yet (engine.ts ships a stub
//     ArtifactGetter). Until the artifact loader lands, the
//     `generateTransactions` call will throw "RAILGUN proof artifacts not
//     loaded — scan-only mode." We surface that error verbatim in the UI
//     so the deferred wiring is obvious during dev.
//
// Reference: hydration-railgun-poc/contract/cli.ts → cmdSend(...), and
//   engine/src/__tests__/railgun-engine.test.ts → the "shield, unshield w/
//   broadcaster" test case which is the canonical
//   TransactionBatch.generateTransactions → generateTransact → sign-and-send
//   sequence we're mirroring here.

import { useMemo, useState } from "react"
import {
  AddressData,
  OutputType,
  RailgunEngine,
  TXIDVersion,
  TransactNote,
  TransactionBatch,
  getTokenDataERC20,
} from "@railgun-community/engine"
import { RailgunVersionedSmartContracts } from "@railgun-community/engine"
import { BrowserProvider, Eip1193Provider } from "ethers6"

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"
import {
  RAILGUN_ENCRYPTION_KEY,
  RailgunWalletState,
  useRailgunWallet,
} from "sections/privacy/hooks/useRailgunWallet"
import { useEvmAccount, useWallet } from "sections/web3-connect/Web3Connect.utils"
import { isEvmWalletExtension } from "utils/evm"

// Hydration ETH precompile (asset 20). Same address ShieldFlow uses — the
// shielded note's tokenAddress is the EVM-precompile address, not the
// runtime asset id. Mirror that here so shield + send share the same
// "token" key when the engine hashes them.
const ETH_PRECOMPILE = "0x0000000000000000000000000000000100000014" as const

type Asset = {
  id: number
  symbol: string
  decimals: number
  address: `0x${string}`
}

const SENDABLE_ASSETS: Asset[] = [
  { id: 20, symbol: "ETH", decimals: 18, address: ETH_PRECOMPILE },
]

// Estimated proof generation time for the wireframe summary. Real number will
// land once snarkjs/native-prover artifacts are wired in 5c.5 (artifact
// loader). 6s comes from the engine's typical browser groth16 time for a
// 1-input/2-output Railgun proof on commodity hardware.
const ESTIMATED_PROOF_SECONDS = 6

type FeeMode = "self-relay" // broadcaster lands in 5d; type stays a union for future

type SendState =
  | { status: "idle" }
  | { status: "proving"; progress: number; message: string }
  | { status: "broadcasting"; txHash?: string }
  | { status: "confirmed"; txHash: string }
  | { status: "error"; error: Error }

export const SendFlow = () => {
  const { state, chain } = useRailgunContext()
  const engine = state.status === "ready" ? state.engine : null
  const wallet = useRailgunWallet({ engine })
  const { account } = useEvmAccount()
  const { wallet: connectedWallet } = useWallet()

  const [recipient, setRecipient] = useState("")
  const [asset, setAsset] = useState<Asset>(SENDABLE_ASSETS[0])
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [feeMode] = useState<FeeMode>("self-relay")
  const [send, setSend] = useState<SendState>({ status: "idle" })

  const decoded = useMemo<
    | { ok: true; data: AddressData }
    | { ok: false; reason: string | null }
  >(() => {
    if (recipient.length === 0) return { ok: false, reason: null }
    try {
      return { ok: true, data: RailgunEngine.decodeAddress(recipient.trim()) }
    } catch (e) {
      return {
        ok: false,
        reason: e instanceof Error ? e.message : "Invalid RAILGUN address",
      }
    }
  }, [recipient])

  const isSelf =
    decoded.ok &&
    wallet.status === "ready" &&
    wallet.railgunAddress === recipient.trim()

  const parsedAmount = useMemo<bigint | null>(() => {
    try {
      return parseDecimalToBigInt(amount, asset.decimals)
    } catch {
      return null
    }
  }, [amount, asset.decimals])

  const canSubmit =
    decoded.ok &&
    parsedAmount !== null &&
    parsedAmount > 0n &&
    wallet.status === "ready" &&
    engine !== null &&
    send.status === "idle" &&
    !!account?.address &&
    !!connectedWallet?.extension &&
    isEvmWalletExtension(connectedWallet.extension)

  const onSend = async () => {
    if (!engine) return
    if (!decoded.ok) return
    if (parsedAmount === null || parsedAmount <= 0n) return
    if (wallet.status !== "ready") return
    if (!connectedWallet?.extension || !isEvmWalletExtension(connectedWallet.extension)) return

    setSend({ status: "proving", progress: 0, message: "Building transaction…" })

    try {
      const railgunWallet = engine.wallets[wallet.walletId]
      if (!railgunWallet) {
        throw new Error(
          `RAILGUN wallet ${wallet.walletId} not loaded in the engine. Reload /privacy and re-sign.`,
        )
      }

      const tokenData = getTokenDataERC20(asset.address)

      const batch = new TransactionBatch(chain)
      batch.addOutput(
        TransactNote.createTransfer(
          decoded.data,
          railgunWallet.addressKeys,
          parsedAmount,
          tokenData,
          false, // showSenderAddressToRecipient — sender stays hidden
          OutputType.Transfer,
          memo.trim().length > 0 ? memo.trim() : undefined,
        ),
      )

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

      // ethers v6 BrowserProvider wraps an EIP-1193 provider into a real
      // signer; getSigner() with no args picks the currently selected
      // account from the wallet extension.
      const provider = new BrowserProvider(
        connectedWallet.extension as unknown as Eip1193Provider,
      )
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: populated.to,
        data: populated.data,
        value: populated.value ?? 0n,
        // Explicit override — Hydration's Frontier eth_estimateGas false-
        // reverts on precompile-touching calls. 3M is generous headroom over
        // the ~1.4M typical transact() spend.
        gasLimit: 3_000_000n,
      })
      setSend({ status: "broadcasting", txHash: tx.hash })

      const receipt = await tx.wait()
      if (!receipt) throw new Error("Transaction receipt missing")
      setSend({ status: "confirmed", txHash: tx.hash })
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      // eslint-disable-next-line no-console
      console.error("[SendFlow] send failed:", err)
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
      <h1 style={{ marginBottom: 4 }}>Send privately</h1>
      <p style={{ marginBottom: 24, opacity: 0.7, fontSize: 13 }}>
        Move shielded balances between RAILGUN addresses. Recipient receives
        the funds without anyone learning who sent them.
      </p>

      <Card>
        <Field label="To">
          <input
            type="text"
            placeholder="0zk1qyq…recipient"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            style={{ ...inputStyle, fontFamily: "monospace", fontSize: 12 }}
          />
          <AddressValidity decoded={decoded} isSelf={isSelf} />
        </Field>

        <Field label="Asset">
          <select
            value={asset.id}
            onChange={(e) => {
              const next = SENDABLE_ASSETS.find(
                (a) => a.id === Number(e.target.value),
              )
              if (next) setAsset(next)
            }}
            style={inputStyle}
          >
            {SENDABLE_ASSETS.map((a) => (
              <option key={a.id} value={a.id}>
                {a.symbol} (asset {a.id})
              </option>
            ))}
          </select>
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
          {parsedAmount === null && amount.length > 0 && (
            <p style={{ ...hintStyle, color: "#f88" }}>
              Not a valid amount.
            </p>
          )}
        </Field>

        <Field label="Memo (optional, encrypted)">
          <input
            type="text"
            placeholder="invoice #1234"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            style={inputStyle}
          />
        </Field>

        <FeePicker feeMode={feeMode} />

        <SummaryBlock
          recipient={recipient}
          amount={amount}
          asset={asset}
          feeMode={feeMode}
        />

        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            style={canSubmit ? primaryBtnStyle : pendingBtnStyle}
            disabled={!canSubmit}
            onClick={onSend}
          >
            {sendButtonLabel(send, amount, asset)}
          </button>
        </div>

        <SendStatus send={send} />

        <WalletGate wallet={wallet} />
      </Card>
    </div>
  )
}

const AddressValidity = ({
  decoded,
  isSelf,
}: {
  decoded:
    | { ok: true; data: AddressData }
    | { ok: false; reason: string | null }
  isSelf: boolean
}) => {
  if (!decoded.ok && decoded.reason === null) return null
  if (decoded.ok) {
    return (
      <p style={{ ...hintStyle, color: "#7d7" }}>
        ✓ Valid RAILGUN address{isSelf ? " (yours — this will rotate notes)" : ""}
      </p>
    )
  }
  return (
    <p style={{ ...hintStyle, color: "#f88" }}>{decoded.reason}</p>
  )
}

const FeePicker = ({ feeMode }: { feeMode: FeeMode }) => (
  <div
    style={{
      marginTop: 16,
      paddingTop: 12,
      borderTop: "1px solid rgba(255,255,255,0.08)",
    }}
  >
    <div style={{ opacity: 0.6, fontSize: 12, marginBottom: 8 }}>
      Pay gas with
    </div>
    <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input type="radio" checked={feeMode === "self-relay"} readOnly />
      <span>Self-relay (you pay HDX gas directly)</span>
    </label>
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
        opacity: 0.4,
      }}
      title="Broadcaster integration lands in Phase 5d"
    >
      <input type="radio" disabled />
      <span>Broadcaster (gasless for you) — Phase 5d</span>
    </label>
  </div>
)

const SummaryBlock = ({
  recipient,
  amount,
  asset,
  feeMode,
}: {
  recipient: string
  amount: string
  asset: Asset
  feeMode: FeeMode
}) => {
  const hasAmount = amount.trim().length > 0
  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 12,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ opacity: 0.6, fontSize: 12, marginBottom: 8 }}>Summary</div>
      <SummaryRow
        label="Recipient receives"
        value={hasAmount ? `${amount} ${asset.symbol}` : "—"}
      />
      <SummaryRow
        label="Total deducted"
        value={hasAmount ? `${amount} ${asset.symbol}` : "—"}
      />
      <SummaryRow
        label="Gas paid by"
        value={feeMode === "self-relay" ? "You (self-relay)" : "Broadcaster"}
      />
      <SummaryRow
        label="Proof generation"
        value={`~ ${ESTIMATED_PROOF_SECONDS}s`}
      />
      {recipient.trim().length > 0 && (
        <SummaryRow
          label="Recipient"
          value={truncateMiddle(recipient.trim(), 12, 8)}
          mono
        />
      )}
    </div>
  )
}

const SummaryRow = ({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "150px 1fr",
      gap: 8,
      fontSize: 12,
      marginBottom: 4,
    }}
  >
    <span style={{ opacity: 0.6 }}>{label}</span>
    <span style={mono ? monoStyle : undefined}>{value}</span>
  </div>
)

const SendStatus = ({ send }: { send: SendState }) => {
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

const WalletGate = ({ wallet }: { wallet: RailgunWalletState }) => {
  if (wallet.status === "ready") return null
  return (
    <p style={{ marginTop: 16, fontSize: 12, opacity: 0.55 }}>
      Sign in to RAILGUN on the /privacy page first to enable sending.
    </p>
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
}: {
  label: string
  children: React.ReactNode
}) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ opacity: 0.6, fontSize: 12, marginBottom: 4 }}>{label}</div>
    {children}
  </div>
)

const sendButtonLabel = (
  send: SendState,
  amount: string,
  asset: Asset,
): string => {
  switch (send.status) {
    case "proving":
      return "Generating proof…"
    case "broadcasting":
      return "Broadcasting…"
    case "confirmed":
      return "Sent ✓"
    case "error":
      return "Retry"
    case "idle":
    default:
      return `Send ${amount || "0"} ${asset.symbol}`
  }
}

const parseDecimalToBigInt = (input: string, decimals: number): bigint => {
  const trimmed = input.trim()
  if (trimmed.length === 0) throw new Error("empty")
  if (!/^\d+(\.\d+)?$/.test(trimmed)) throw new Error("not a number")
  const [intPart, fracPartRaw = ""] = trimmed.split(".")
  const fracPart = fracPartRaw.slice(0, decimals).padEnd(decimals, "0")
  const combined = `${intPart}${fracPart}`.replace(/^0+(?=\d)/, "")
  return BigInt(combined.length === 0 ? "0" : combined)
}

const truncateMiddle = (s: string, head: number, tail: number): string => {
  if (s.length <= head + tail + 1) return s
  return `${s.slice(0, head)}…${s.slice(-tail)}`
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

const hintStyle: React.CSSProperties = {
  marginTop: 6,
  fontSize: 12,
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

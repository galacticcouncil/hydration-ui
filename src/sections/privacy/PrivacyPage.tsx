// Phase 5a — Privacy landing page. Engine package smoke-check + config display.
// Wallet creation, scan, and flows land in 5b/5c.

import { useRailgunContext } from "sections/privacy/providers/RailgunProvider"

export const PrivacyPage = () => {
  const { state, config } = useRailgunContext()

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 720,
        margin: "0 auto",
        color: "white",
        fontFamily:
          "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
      }}
    >
      <h1 style={{ marginBottom: 12 }}>Privacy</h1>
      <p style={{ marginBottom: 24, opacity: 0.7 }}>
        Shielded balances powered by RAILGUN. Phase 5a — engine package
        smoke-check only. Wallet + flows ship in 5b/5c.
      </p>

      <div
        style={{
          padding: 20,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <StatusDot status={state.status} />
          <strong>
            {state.status === "idle" && "Idle"}
            {state.status === "ready" && "Engine package OK"}
            {state.status === "error" && "Engine package failed"}
          </strong>
        </div>

        <dl
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: 8,
            margin: 0,
          }}
        >
          <dt style={{ opacity: 0.6 }}>Network</dt>
          <dd style={{ margin: 0 }}>{config.label}</dd>

          <dt style={{ opacity: 0.6 }}>Chain ID</dt>
          <dd style={{ margin: 0 }}>{config.chainId}</dd>

          <dt style={{ opacity: 0.6 }}>Proxy</dt>
          <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 12 }}>
            {config.proxy}
          </dd>

          <dt style={{ opacity: 0.6 }}>RelayAdapt</dt>
          <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 12 }}>
            {config.relayAdapt}
          </dd>

          <dt style={{ opacity: 0.6 }}>RPC</dt>
          <dd style={{ margin: 0, fontFamily: "monospace", fontSize: 12 }}>
            {config.rpcUrl}
          </dd>
        </dl>

        {state.status === "error" && (
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              background: "rgba(0,0,0,0.3)",
              borderRadius: 4,
              fontSize: 11,
              whiteSpace: "pre-wrap",
              color: "#f88",
            }}
          >
            {state.error.message}
          </pre>
        )}
      </div>
    </div>
  )
}

const StatusDot = ({ status }: { status: string }) => {
  const color =
    status === "ready"
      ? "#0a0"
      : status === "error"
        ? "#c00"
        : "#888"
  return (
    <span
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        display: "inline-block",
        background: color,
      }}
    />
  )
}

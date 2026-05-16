// Phase 5d — broadcaster picker UI primitive.
//
// Radio list of discovered broadcasters + a "Pay gas yourself" (self-relay)
// row. Plain HTML, same visual register as PrivacyPage/ShieldFlow until the
// design tokens-based UI in @galacticcouncil/ui replaces it.
//
// The picker is intentionally a presentational primitive — it reads/writes
// against `useBroadcasters()` so a parent can drop <BroadcasterPicker /> into
// any flow (Privacy page, Send modal, Unshield modal, Swap modal) without
// extra wiring.
//
// Phase 5d UX rules:
//   - When `isMock` is true (Waku still starting, or failed to start), show
//     a yellow "MOCK" badge + the static demo broadcaster row.
//   - When `isMock` is false and `list.length > 0`, show real broadcaster
//     rows with the live announcement's address as the title (no
//     "(mock)" suffix).
//   - When `isMock` is false but `list.length === 0`, show the
//     `fallbackReason` from the provider as a notice and keep the
//     self-relay row selectable. This is the "no broadcasters online,
//     falling back to self-relay" state the spec asks for.
//   - The connection-status pill ("Searching", "Connected", "Disconnected",
//     "Error") sits next to the MOCK badge so an operator can see at a
//     glance whether Waku is up or not.

import { BroadcasterConnectionStatus } from "@galacticcouncil/railgun-waku-broadcaster-client"

import { useBroadcasters } from "sections/privacy/hooks/useBroadcasters"
import { Broadcaster } from "sections/privacy/utils/broadcasters"

type Props = {
  /** If true, hides the self-relay row (used when self-relay is not viable). */
  hideSelfRelay?: boolean
  /** Compact mode — used inside modals. */
  compact?: boolean
}

export const BroadcasterPicker = ({
  hideSelfRelay = false,
  compact = false,
}: Props) => {
  const { list, selected, select, refresh, isMock, status, fallbackReason } =
    useBroadcasters()

  return (
    <div style={containerStyle(compact)}>
      <Header onRefresh={refresh} isMock={isMock} status={status} />

      <div role="radiogroup" aria-label="Pay gas with">
        {!hideSelfRelay && (
          <Row
            selected={selected === null}
            onClick={() => select(null)}
            title="Pay gas yourself"
            subtitle="Your wallet sends the transaction. Reveals your EVM address as the sender."
          />
        )}
        {list.length === 0 ? (
          <div style={emptyStyle}>
            {fallbackReason ?? "No broadcasters online. Falling back to self-relay."}
          </div>
        ) : (
          list.map((b) => (
            <BroadcasterRow
              key={b.railgunAddress}
              broadcaster={b}
              selected={selected?.railgunAddress === b.railgunAddress}
              onSelect={() => select(b)}
            />
          ))
        )}

        {/* Persistent inline note when (a) a real broadcaster is selected
            but transact path falls back to self-relay, or (b) we're on
            MOCK. The provider also logs to console; this surface is for
            the user. */}
        {fallbackReason && list.length > 0 && (
          <div style={inlineNoteStyle}>{fallbackReason}</div>
        )}
      </div>
    </div>
  )
}

const Header = ({
  onRefresh,
  isMock,
  status,
}: {
  onRefresh: () => void
  isMock: boolean
  status: BroadcasterConnectionStatus
}) => (
  <div style={headerStyle}>
    <span style={{ opacity: 0.7, fontSize: 13 }}>Pay gas with</span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <StatusPill status={status} />
      {isMock && (
        <span style={mockBadgeStyle} title="Waku client not yet connected">
          MOCK
        </span>
      )}
      <button type="button" onClick={onRefresh} style={refreshBtnStyle}>
        Refresh
      </button>
    </div>
  </div>
)

const StatusPill = ({ status }: { status: BroadcasterConnectionStatus }) => {
  const { label, color } = statusVisuals(status)
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        padding: "2px 6px",
        background: `${color}22`,
        color,
        borderRadius: 4,
        letterSpacing: 0.5,
      }}
      title={`Waku connection: ${label}`}
    >
      {label.toUpperCase()}
    </span>
  )
}

// Map upstream connection-status enum to a label + color the UI can render
// without pulling in the design-tokens package. Mirrors the rough
// semantics of `BroadcasterConnectionStatus` in shared-models.
const statusVisuals = (
  status: BroadcasterConnectionStatus,
): { label: string; color: string } => {
  switch (status) {
    case BroadcasterConnectionStatus.Connected:
      return { label: "connected", color: "#4ade80" }
    case BroadcasterConnectionStatus.Searching:
      return { label: "searching", color: "#fbbf24" }
    case BroadcasterConnectionStatus.AllUnavailable:
      return { label: "all busy", color: "#fbbf24" }
    case BroadcasterConnectionStatus.Disconnected:
      return { label: "offline", color: "#94a3b8" }
    case BroadcasterConnectionStatus.Error:
      return { label: "error", color: "#f87171" }
    default:
      return { label: String(status), color: "#94a3b8" }
  }
}

const BroadcasterRow = ({
  broadcaster,
  selected,
  onSelect,
}: {
  broadcaster: Broadcaster
  selected: boolean
  onSelect: () => void
}) => {
  const fee = broadcaster.fees[0]
  const lastSeenSecs = Math.max(
    1,
    Math.round((Date.now() - broadcaster.lastSeenAt) / 1000),
  )
  // For real broadcasters we don't have a friendly identifier yet — show
  // the railgun address shortened. For MOCK rows the seed data has
  // "Hydration team (mock)" already; keep that as-is.
  const title = broadcaster.__MOCK__
    ? `${broadcaster.identifier} · v${broadcaster.version}`
    : `${broadcaster.identifier} · ${
        broadcaster.version === "unknown" ? "" : `v${broadcaster.version} · `
      }${broadcaster.availableWallets} wallets`
  return (
    <Row
      selected={selected}
      onClick={onSelect}
      title={title}
      subtitle={
        fee
          ? `Fee in ${fee.symbol} · reliability ${(broadcaster.reliability * 100).toFixed(0)}% · seen ${lastSeenSecs}s ago`
          : `${broadcaster.availableWallets} wallets · reliability ${(broadcaster.reliability * 100).toFixed(0)}% · seen ${lastSeenSecs}s ago`
      }
      mono={broadcaster.railgunAddress}
    />
  )
}

const Row = ({
  selected,
  onClick,
  title,
  subtitle,
  mono,
}: {
  selected: boolean
  onClick: () => void
  title: string
  subtitle: string
  mono?: string
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onClick}
    style={rowStyle(selected)}
  >
    <span style={radioDotStyle(selected)} />
    <div style={{ flex: 1, textAlign: "left" }}>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{subtitle}</div>
      {mono && <div style={monoStyle}>{mono}</div>}
    </div>
  </button>
)

const containerStyle = (compact: boolean): React.CSSProperties => ({
  padding: compact ? 12 : 16,
  background: "rgba(255,255,255,0.04)",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.08)",
  display: "flex",
  flexDirection: "column",
  gap: 8,
})

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 4,
}

const mockBadgeStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: "2px 6px",
  background: "rgba(255, 200, 0, 0.18)",
  color: "#fc6",
  borderRadius: 4,
  letterSpacing: 0.5,
}

const refreshBtnStyle: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: 12,
  background: "transparent",
  color: "rgba(255,255,255,0.8)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: 4,
  cursor: "pointer",
}

const rowStyle = (selected: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "flex-start",
  gap: 12,
  padding: 12,
  width: "100%",
  background: selected ? "rgba(255,255,255,0.08)" : "transparent",
  border: `1px solid ${
    selected ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"
  }`,
  borderRadius: 6,
  color: "white",
  cursor: "pointer",
  marginTop: 6,
})

const radioDotStyle = (selected: boolean): React.CSSProperties => ({
  flexShrink: 0,
  width: 14,
  height: 14,
  borderRadius: "50%",
  marginTop: 3,
  border: "2px solid rgba(255,255,255,0.5)",
  background: selected ? "white" : "transparent",
})

const emptyStyle: React.CSSProperties = {
  padding: 12,
  fontSize: 12,
  opacity: 0.7,
  marginTop: 6,
  textAlign: "center",
  border: "1px dashed rgba(255,255,255,0.12)",
  borderRadius: 6,
}

const inlineNoteStyle: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: 11,
  opacity: 0.7,
  marginTop: 8,
  textAlign: "center",
  background: "rgba(255,255,255,0.03)",
  borderRadius: 4,
  border: "1px solid rgba(255,255,255,0.06)",
}

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 10,
  opacity: 0.5,
  marginTop: 4,
  wordBreak: "break-all",
}

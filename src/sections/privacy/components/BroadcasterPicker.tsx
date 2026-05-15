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
  const { list, selected, select, refresh, isMock } = useBroadcasters()

  return (
    <div style={containerStyle(compact)}>
      <Header onRefresh={refresh} isMock={isMock} />

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
            No broadcasters online. Falling back to self-relay.
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
      </div>
    </div>
  )
}

const Header = ({
  onRefresh,
  isMock,
}: {
  onRefresh: () => void
  isMock: boolean
}) => (
  <div style={headerStyle}>
    <span style={{ opacity: 0.7, fontSize: 13 }}>Pay gas with</span>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {isMock && (
        <span style={mockBadgeStyle} title="Mock data — Phase 3 fork pending">
          MOCK
        </span>
      )}
      <button type="button" onClick={onRefresh} style={refreshBtnStyle}>
        Refresh
      </button>
    </div>
  </div>
)

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
  return (
    <Row
      selected={selected}
      onClick={onSelect}
      title={`${broadcaster.identifier} · v${broadcaster.version}`}
      subtitle={
        fee
          ? `Fee in ${fee.symbol} · ${broadcaster.availableWallets} wallets · reliability ${(broadcaster.reliability * 100).toFixed(0)}% · seen ${lastSeenSecs}s ago`
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
  opacity: 0.55,
  marginTop: 6,
  textAlign: "center",
  border: "1px dashed rgba(255,255,255,0.12)",
  borderRadius: 6,
}

const monoStyle: React.CSSProperties = {
  fontFamily: "monospace",
  fontSize: 10,
  opacity: 0.5,
  marginTop: 4,
  wordBreak: "break-all",
}

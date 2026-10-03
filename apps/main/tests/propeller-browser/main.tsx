import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { DepositForm } from "../../src/modules/strategies/propeller/components/DepositForm"
import { PROPELLER_VAULTS } from "../../src/modules/strategies/propeller/config/vaults"
window.fixture = {
  stats: {
    totalAssets: 2,
    tvlCap: 10,
    paused: false,
    depositsPaused: false,
    underfunded: false,
  },
  admission: { minimum: 10n ** 16n, maximum: 2n * 10n ** 18n, expired: false },
  balance: 3n * 10n ** 18n,
  error: false,
  rpcReady: true,
  submitted: [],
}
function Harness() {
  const [version, setVersion] = useState(0)
  window.updateFixture = (values) => {
    Object.assign(window.fixture, values)
    setVersion((v) => v + 1)
  }
  return (
    <div data-version={version}>
      <DepositForm initialVault={PROPELLER_VAULTS[0]} />
    </div>
  )
}
createRoot(document.getElementById("root")!).render(<Harness />)

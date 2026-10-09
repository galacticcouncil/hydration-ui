import React, { useState } from "react"
import { createRoot } from "react-dom/client"
import { ReviewTransactionSubmitButton } from "../../src/modules/transactions/review/ReviewTransactionSubmitButton"
import { DepositForm } from "../../src/modules/strategies/propeller/components/DepositForm"
import { WithdrawModalForm } from "../../src/modules/strategies/propeller/components/WithdrawModalForm"
import { WithdrawalsCard } from "../../src/modules/strategies/propeller/components/WithdrawalsCard"
import { PROPELLER_VAULTS } from "../../src/modules/strategies/propeller/config/vaults"
window.fixture = {
  mode: "deposit",
  capacity: { maximum: 7n * 10n ** 18n, ready: true, paused: false },
  balance: 8n * 10n ** 18n,
  error: false,
  rpcReady: true,
  submitted: [],
  withdrawals: [],
  claims: [],
  signatures: [],
  preparing: true,
  rows: [],
  stats: { exchangeRate: 1, paused: false, minRedeem: 0, withdrawalDelay: 60 },
  balances: { sharesExact: "8" },
  subLoop: { negativeCarry: 0 },
  price: 2500,
}
function Harness() {
  const [version, setVersion] = useState(0)
  window.updateFixture = (values) => {
    Object.assign(window.fixture, values)
    setVersion((v) => v + 1)
  }
  return (
    <div data-version={version}>
      {window.fixture.mode === "review" ? (
        <ReviewTransactionSubmitButton />
      ) : window.fixture.mode === "withdrawals" ? (
        <WithdrawalsCard rows={window.fixture.rows} />
      ) : window.fixture.mode === "withdraw" ? (
        <WithdrawModalForm vault={PROPELLER_VAULTS[0]} onSuccess={() => {}} />
      ) : (
        <DepositForm initialVault={PROPELLER_VAULTS[0]} />
      )}
    </div>
  )
}
createRoot(document.getElementById("root")!).render(<Harness />)

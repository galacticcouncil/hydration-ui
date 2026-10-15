import type { App, Locator, Screen } from "e2e"
import { expect, test } from "e2e"

// The seeded account header proves only the app shell loaded. Page data has
// separate readiness checks in readiness.ts.
export const ACCOUNT = "135yiujiLFfogvTwbfr3yoqGK7zAu3f5SD5y1q8PMokYeSuc"

export const PAGE_LOAD_TIMEOUT = 60_000

export const openPage = async (app: App, screen: Screen, path: string) => {
  await app.open(path)
  await expect(
    screen.getByRole("button", /External Account 135yiu…kYeSuc$/),
  ).toBeVisible({ timeout: PAGE_LOAD_TIMEOUT })
}

// Mainnet asset ids; the router JSON-encodes search ids ("0" -> %220%22).
export const ASSET = { HDX: "0", DOT: "5", USDT: "10", HOLLAR: "222" }
export const swapUrl = (tab: string, assetIn: string, assetOut: string) =>
  `/trade/swap/${tab}?assetIn=%22${assetIn}%22&assetOut=%22${assetOut}%22`

// The furthest any test goes: the review dialog. A watch-only account gets
// "Open in Polkadot.js.org" where a wallet would sign, and Close leaves chain
// state untouched. Titles differ per flow, so find it by that link.
export const expectReviewThenClose = async (screen: Screen, call: RegExp) => {
  const dialog = screen
    .getByRole("dialog")
    .filter({ has: screen.getByRole("link", "Open in Polkadot.js.org") })
  await expect(dialog).toBeVisible({ timeout: 30_000 })
  await expect(dialog).toContainText(call)
  // Returned so a test can pull values out of the decoded call.
  const text = (await dialog.textContent()) ?? ""
  await dialog.getByRole("button", "Close").tap()
  await expect(dialog).toHaveCount(0)
  return text
}

// Search matches case-insensitively, so does the row check.
// Skeleton cells contain zero-width non-joiners. Wait for actual data before
// checking a filtered result, so an empty table cannot pass Array.every().
export const expectDataRows = async (table: Locator, text?: string) => {
  await expect
    .poll(
      async () => {
        const rows = (await table.getByRole("row").allTextContents())
          .slice(1)
          .map((row) => row.replace(/\u200c/g, "").trim())
        return (
          rows.length > 0 &&
          rows.every(
            (row) =>
              row.length > 0 &&
              (!text || row.toLowerCase().includes(text.toLowerCase())),
          )
        )
      },
      { timeout: PAGE_LOAD_TIMEOUT },
    )
    .toBe(true)
}

// Live mainnet: when the account cannot cover the amount a test needs, report a
// skip instead of a failure. "Balance:" shows a skeleton until loaded, so wait
// for the number. The first "Balance:" in scope is read; without an amount any
// nonzero balance is enough.
export const skipIfBalanceBelow = async (scope: Locator, amount = 0) => {
  let balance = NaN
  await expect
    .poll(
      async () => {
        const label = await scope
          .getByText(/^Balance: /)
          .first()
          .textContent()
        balance = parseFloat((label ?? "").replace(/[^\d.]/g, ""))
        return Number.isFinite(balance)
      },
      { timeout: PAGE_LOAD_TIMEOUT },
    )
    .toBe(true)
  test.skip(
    balance <= 0 || balance < amount,
    `account balance ${balance} cannot cover ${amount || "any amount"}`,
  )
}

// Live mainnet: skip a search test when no loaded row (first page only) holds
// the asset it searches for.
export const skipUnlessRowHas = async (table: Locator, text: string) => {
  await expectDataRows(table)
  const rows = await table.getByRole("row").allTextContents()
  test.skip(
    !rows.some((row) => row.toLowerCase().includes(text.toLowerCase())),
    `no ${text} row on mainnet right now`,
  )
}

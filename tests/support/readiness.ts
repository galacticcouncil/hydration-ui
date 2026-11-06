import type { Browser } from "@e2e-dev/web"
import type { Screen } from "e2e"
import { expect } from "e2e"

import { expectDataRows, PAGE_LOAD_TIMEOUT } from "./app"

const loaded = { timeout: PAGE_LOAD_TIMEOUT }

export const expectCrossChainReady = async (
  screen: Screen,
  source: "assethub" | "hydration" = "assethub",
) => {
  const from = screen.getByTestId("xcm-source")
  const to = screen.getByTestId("xcm-destination")
  const chain = (key: "assethub" | "hydration") =>
    `Polkadot ${key === "assethub" ? 1000 : 2034} DOT DOT`
  await expect(from.getByRole("button", chain(source))).toBeVisible(loaded)
  await expect(
    to.getByRole(
      "button",
      chain(source === "assethub" ? "hydration" : "assethub"),
    ),
  ).toBeVisible(loaded)
  await expect(from).toHaveAttribute("aria-busy", "false", loaded)
  await expect(to).toHaveAttribute("aria-busy", "false", loaded)
  await expect(screen.getByTestId("xcm-form")).toHaveAttribute(
    "aria-busy",
    "false",
    loaded,
  )
  // LoadingButton retains its busy state briefly after RPC work finishes.
  await expect(screen.getByTestId("xcm-submit")).toHaveAttribute(
    "aria-busy",
    "false",
    loaded,
  )
}

export const expectCrossChainRoute = async (
  browser: Browser,
  source: "assethub" | "hydration" = "assethub",
) => {
  // Compare parameters independently: router serialization order is immaterial.
  await expect
    .poll(async () => {
      const { searchParams } = new URL(await browser.url())
      return Object.fromEntries(
        ["srcChain", "srcAsset", "destChain", "destAsset"].map((key) => [
          key,
          searchParams.get(key),
        ]),
      )
    }, loaded)
    .toEqual({
      srcChain: source,
      srcAsset: "dot",
      destChain: source === "assethub" ? "hydration" : "assethub",
      destAsset: "dot",
    })
}

export type NavigationPage =
  | "Borrow"
  | "Strategies"
  | "Liquidity"
  | "Portfolio"
  | "Cross-Chain"
  | "Stats"
  | "Staking"
  | "Trade"

// Each destination must render usable content, not just change its URL. These
// checks intentionally require data that a skeleton or error boundary lacks.
export const expectNavigationPageReady = async (
  screen: Screen,
  page: NavigationPage,
) => {
  switch (page) {
    case "Borrow": {
      for (const name of [
        "My supplies",
        "My borrows",
        "Assets to supply",
        "Assets to borrow",
      ])
        await expect(screen.getByRole("heading", name)).toBeVisible(loaded)
      const dot = screen
        .getByRole("row", /^DOT DOT /)
        .filter({ has: screen.getByRole("button", "Supply") })
      await expect(dot).toContainText(/\$[\d.,]+/, loaded)
      await expect(dot.getByRole("button", "Supply")).toBeEnabled(loaded)
      return
    }
    case "Strategies": {
      const bil = screen
        .getByTestId("strategy-card")
        .filter({ has: screen.getByRole("link", "Brazilian Invoice Loans") })
      await expect(bil).toBeVisible(loaded)
      await expect(bil).toHaveAttribute("aria-busy", "false", loaded)
      await expect(bil).toContainText(/[\d.,]+%/, loaded)
      await expect(screen.getByRole("link", "HOLLAR Bonds")).toHaveAttribute(
        "href",
        "/strategies/hollar-bonds",
        loaded,
      )
      return
    }
    case "Liquidity":
      await expect(screen.getByRole("columnheader", "Pair")).toBeVisible(loaded)
      await expectDataRows(
        screen
          .getByRole("table")
          .filter({ has: screen.getByRole("columnheader", "Pair") }),
      )
      return
    case "Portfolio":
      await expect(
        screen.getByRole("button", /^Polkadot 2034 Hydration \$/),
      ).toBeVisible(loaded)
      await expectDataRows(
        screen.getByRole("table").filter({
          has: screen.getByRole("columnheader", "Transferable balance"),
        }),
      )
      return
    case "Cross-Chain":
      await expectCrossChainReady(screen)
      return
    case "Stats":
      await expect(
        screen.getByRole(
          "image",
          "Protocol revenue and fees over time, by stream",
        ),
      ).toBeVisible(loaded)
      await expect(screen.getByRole("button", /^Borrow APR \$/)).toBeVisible(
        loaded,
      )
      await expect(screen.getByTestId("fees-chart")).toHaveAttribute(
        "aria-busy",
        "false",
        loaded,
      )
      await expect(screen.getByTestId("fees-chart-total")).toBeVisible(loaded)
      await expect(screen.getByTestId("fees-chart-total")).toContainText(
        /\$[\d.,]+/,
        loaded,
      )
      return
    case "Staking":
      await expect(screen.getByRole("button", /^Recent APR .*%/)).toBeVisible(
        loaded,
      )
      await expect(screen.getByRole("button", "Stake as GIGAHDX")).toBeDisabled(
        loaded,
      )
      await expect(
        screen.getByRole("main").getByRole("textbox"),
      ).toHaveAttribute("aria-busy", "false", loaded)
      return
    case "Trade":
      await expect(
        screen.getByRole("button", /^1 \S+ = [\d., ]+ \S+$/),
      ).toBeVisible(loaded)
      for (const field of ["trade-sell", "trade-buy"])
        await expect(
          screen.getByTestId(field).getByRole("textbox"),
        ).toHaveAttribute("aria-busy", "false", loaded)
      await expect(screen.getByRole("button", "Enter an amount")).toBeDisabled(
        loaded,
      )
      return
  }
}

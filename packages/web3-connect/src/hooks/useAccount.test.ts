import { createElement, Fragment } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { AccountOverrideProvider } from "@/context/AccountOverrideContext"
import { useAccount } from "@/hooks/useAccount"
import type { Account } from "@/hooks/useWeb3Connect"

const state = vi.hoisted(() => ({
  account: null as Account | null,
  accounts: [] as Account[],
  disconnect: vi.fn(),
}))
vi.mock("@/hooks/useWeb3Connect", () => ({
  useWeb3Connect: (selector: (value: typeof state) => unknown) =>
    selector(state),
}))
vi.mock("@/utils", () => ({ toAccount: (account: Account) => account }))

const receiver = {
  address: "receiver",
  provider: "subwallet",
  name: "Main portfolio",
} as Account
const source = {
  address: "source",
  provider: "polkadot-js",
  name: "Background source",
} as Account
const Probe = () =>
  createElement("span", null, useAccount().account?.name ?? "none")
const render = (account: Account | null | undefined) =>
  renderToStaticMarkup(
    createElement(
      Fragment,
      null,
      createElement(Probe),
      createElement(
        AccountOverrideProvider,
        { value: account },
        createElement(Probe),
      ),
      createElement(Probe),
    ),
  )

beforeEach(() => {
  state.account = receiver
  state.accounts = [receiver, source]
})

describe("local signing account", () => {
  it("uses the deposit source inside its scope and leaves both portfolio siblings active", () => {
    expect(render(source)).toBe(
      "<span>Main portfolio</span><span>Background source</span><span>Main portfolio</span>",
    )
    expect(state.account).toBe(receiver)
  })
  it("keeps an unselected source empty instead of falling back to the active wallet", () => {
    expect(render(null)).toContain("<span>none</span>")
    expect(render(undefined)).not.toContain("<span>none</span>")
  })
  it("invalidates a disconnected source without silently signing with the portfolio wallet", () => {
    state.accounts = [receiver]
    expect(render(source)).toBe(
      "<span>Main portfolio</span><span>none</span><span>Main portfolio</span>",
    )
    expect(state.account).toBe(receiver)
  })
  it("does not change an already selected source when the portfolio changes", () => {
    state.account = { ...receiver, name: "Another portfolio" }
    expect(render(source)).toBe(
      "<span>Another portfolio</span><span>Background source</span><span>Another portfolio</span>",
    )
  })
})

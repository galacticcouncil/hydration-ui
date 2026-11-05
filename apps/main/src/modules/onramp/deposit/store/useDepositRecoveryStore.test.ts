import type { Account } from "@galacticcouncil/web3-connect"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  DepositRecovery,
  useDepositRecoveryStore,
} from "./useDepositRecoveryStore"

vi.hoisted(() => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  })
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  })
})

const source = { address: "0x123", provider: "metamask" } as Account
const draft: DepositRecovery = {
  id: "first",
  source,
  destination: null,
  destinationAddress: "recipient",
  chainKey: "ethereum",
  assetKey: "eth",
  symbol: "ETH",
  amount: "0.001",
  stage: "setup",
}
const store = () => useDepositRecoveryStore.getState()
let saved = ""
beforeEach(() => {
  useDepositRecoveryStore.persist.setOptions({
    storage: {
      getItem: () => (saved ? JSON.parse(saved) : null),
      setItem: (_name, value) => {
        saved = JSON.stringify(value)
      },
      removeItem: () => {
        saved = ""
      },
    },
  })
  useDepositRecoveryStore.setState({ deposits: [] })
})
describe("deposit interruption recovery", () => {
  it("restores the original intent and pending hash after rehydration", async () => {
    store().save(draft)
    store().update(draft.id, { stage: "pending", txHash: "approval-hash" })
    const persisted = saved
    useDepositRecoveryStore.setState({ deposits: [] })
    saved = persisted
    await useDepositRecoveryStore.persist.rehydrate()
    expect(store().deposits).toEqual([
      { ...draft, stage: "pending", txHash: "approval-hash" },
    ])
  })
  it("keeps multiple transfers on the same route independent", () => {
    store().save(draft)
    store().update(draft.id, { stage: "transfer", txHash: "transfer-hash" })
    store().save({ ...draft, id: "second" })
    expect(store().deposits).toEqual([
      { ...draft, stage: "transfer", txHash: "transfer-hash" },
      { ...draft, id: "second" },
    ])
  })
  it("clears a confirmed prerequisite hash before a new step", async () => {
    store().save({ ...draft, stage: "pending", txHash: "wrap-hash" })
    store().update(draft.id, { stage: "setup", txHash: undefined })
    await useDepositRecoveryStore.persist.rehydrate()
    expect(store().deposits[0]?.stage).toBe("setup")
    expect(store().deposits[0]?.txHash).toBeUndefined()
  })
})

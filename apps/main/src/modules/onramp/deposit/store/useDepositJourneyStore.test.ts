import type { Account } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  SubmittedDeposit,
  useDepositJourneyStore,
} from "./useDepositJourneyStore"

vi.mock("zustand/middleware", () => ({ persist: (state: unknown) => state }))
const recipient = {
  name: "Main",
  address: "main",
  rawAddress: "main",
  displayAddress: "main",
  publicKey: "main",
  provider: WalletProviderType.Talisman,
  canUseOnHydration: true,
} satisfies Account
const source = {
  ...recipient,
  name: "Phantom",
  address: "solana",
  rawAddress: "solana",
  provider: WalletProviderType.Phantom,
  canUseOnHydration: false,
}
const transfer = {
  txHash: "first",
  sourceAddress: "solana",
  destinationAddress: "main",
  sourceChainKey: "solana",
  symbol: "SOL",
  amount: "5",
  receivedAmount: "4.99",
  receivedSymbol: "SOL",
  sentAt: 100,
  settled: false,
} satisfies SubmittedDeposit
const journey = () => useDepositJourneyStore.getState()
beforeEach(() =>
  useDepositJourneyStore.setState(
    useDepositJourneyStore.getInitialState(),
    true,
  ),
)

describe("v3 deposit journey", () => {
  it("uses the active portfolio receiver when reopening instead of an older saved destination", () => {
    journey().setDestination("old", { ...recipient, address: "old" })
    journey().start(recipient)
    expect(journey()).toMatchObject({
      suggestedDestinationAccount: recipient,
      destinationAccount: null,
      destinationAddress: "",
      destinationConfirmed: false,
    })
  })
  it("checks a guided receiver in place without losing the amount or source", () => {
    journey().setSelection(
      { account: source, chainKey: "solana", assetKey: "sol" },
      { stayOnSources: true },
    )
    journey().setAmount("12.5")
    journey().setDestination("main", recipient, { stayOnSources: true })
    expect(journey()).toMatchObject({
      phase: "sources",
      destinationConfirmed: true,
      destinationAddress: "main",
      destinationAccount: recipient,
      amount: "12.5",
      selection: { account: source },
    })
    journey().setDestination(
      "another",
      { ...recipient, address: "another" },
      {
        stayOnSources: true,
      },
    )
    expect(journey()).toMatchObject({
      phase: "sources",
      destinationAddress: "another",
      amount: "12.5",
    })
  })
  it("keeps guided account selection on the source step until the receiver is checked again", () => {
    journey().setDestination("main", recipient)
    journey().setSelection(
      {
        account: source,
        chainKey: "solana",
        assetKey: "sol",
      },
      { stayOnSources: true },
    )
    expect(journey()).toMatchObject({
      phase: "sources",
      selection: { account: source },
      destinationAccount: recipient,
      destinationConfirmed: false,
    })
    journey().setDestination("main", recipient)
    expect(journey()).toMatchObject({
      phase: "amount",
      destinationConfirmed: true,
      selection: { account: source },
    })
  })
  it("connects sources before showing held assets and preserves the original active receiver independently", () => {
    journey().start(recipient)
    expect(journey()).toMatchObject({
      phase: "sources",
      suggestedDestinationAccount: recipient,
      destinationConfirmed: false,
    })
    journey().setPhase("assets")
    journey().setSelection({
      account: source,
      chainKey: "solana",
      assetKey: "sol",
    })
    expect(journey()).toMatchObject({
      phase: "destination",
      suggestedDestinationAccount: recipient,
      selection: { account: source },
    })
  })
  it("keeps the receiver for another deposit without asking to connect again", () => {
    journey().setDestination("main", recipient)
    journey().setSelection({
      account: source,
      chainKey: "solana",
      assetKey: "sol",
    })
    journey().setSubmitted(transfer)
    journey().depositMore()
    expect(journey()).toMatchObject({
      phase: "assets",
      destinationAddress: "main",
      destinationAccount: recipient,
      destinationConfirmed: true,
      submitted: null,
      pendingTransfers: [transfer],
    })
    journey().setSelection({
      account: recipient,
      chainKey: "assethub",
      assetKey: "usdc",
    })
    expect(journey().phase).toBe("amount")
  })
  it("keeps entered amount when switching the source of the same asset, but resets it for another asset", () => {
    journey().setDestination("main", recipient)
    journey().setSelection({
      account: recipient,
      chainKey: "ethereum",
      assetKey: "usdc",
    })
    journey().setAmount("40.5")
    journey().setSelection({
      account: recipient,
      chainKey: "assethub",
      assetKey: "usdc",
    })
    expect(journey().amount).toBe("40.5")
    journey().setSelection({
      account: source,
      chainKey: "solana",
      assetKey: "sol",
    })
    expect(journey().amount).toBe("")
  })
  it("retains all pending transfers and updates the correct one after Deposit more", () => {
    journey().setSubmitted(transfer)
    journey().depositMore()
    const second = { ...transfer, txHash: "second" }
    journey().setSubmitted(second)
    journey().updateSubmitted({ settled: true }, "first")
    expect(journey().pendingTransfers).toEqual([second])
    expect(journey().submitted).toEqual(second)
    journey().updateSubmitted({ settled: true }, "second")
    expect(journey().pendingTransfers).toEqual([])
    expect(journey().submitted?.settled).toBe(true)
  })
  it("reopens new deposits with the confirmed receiver while clearing old amount and source", () => {
    journey().setDestination("main", recipient)
    journey().setSelection({
      account: source,
      chainKey: "solana",
      assetKey: "sol",
    })
    journey().setAmount("3")
    journey().start(source)
    expect(journey()).toMatchObject({
      phase: "sources",
      selection: null,
      amount: "",
      destinationAddress: "main",
      destinationConfirmed: true,
    })
  })
})

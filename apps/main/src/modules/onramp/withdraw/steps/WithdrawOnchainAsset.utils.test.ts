import type { Account } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import type { Asset } from "@galacticcouncil/xc-core"
import { describe, expect, it } from "vitest"

import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

import { getWithdrawSelectionFormValues } from "./WithdrawOnchainAsset.utils"

const hydration = chainsMap.get("hydration")!
const assethub = chainsMap.get("assethub")!
const ethereum = chainsMap.get("ethereum")!
const base = chainsMap.get("base")!
const dot = { key: "dot" } as Asset
const usdc = { key: "usdc" } as Asset
const substrateAddress = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
const evmAddress = "0x0000000000000000000000000000000000000001"
const recipient = { address: substrateAddress } as Account
const previous: XcmFormValues = {
  srcChain: hydration,
  srcAsset: dot,
  destChain: assethub,
  destAsset: dot,
  srcAmount: "10",
  destAmount: "9.9",
  destAddress: substrateAddress,
  destAccount: recipient,
  bridgeProvider: "old-provider",
}

describe("withdraw destination reselection", () => {
  it("retains a valid recipient while replacing the exact source/destination route", () => {
    const next = getWithdrawSelectionFormValues(previous, {
      sourceChain: hydration,
      sourceAsset: usdc,
      destinationChain: assethub,
      destinationAsset: usdc,
    })
    expect(next).toMatchObject({
      srcChain: hydration,
      srcAsset: usdc,
      destChain: assethub,
      destAsset: usdc,
      srcAmount: "",
      destAmount: "",
      bridgeProvider: null,
      destAddress: substrateAddress,
      destAccount: recipient,
    })
  })
  it("clears a recipient that is incompatible with the new destination", () => {
    const next = getWithdrawSelectionFormValues(previous, {
      sourceChain: hydration,
      sourceAsset: usdc,
      destinationChain: ethereum,
      destinationAsset: usdc,
    })
    expect(next.destAddress).toBe("")
    expect(next.destAccount).toBeNull()
  })
  it("keeps an EVM recipient valid on another EVM destination", () => {
    const evmRecipient = { address: evmAddress } as Account
    const next = getWithdrawSelectionFormValues(
      { ...previous, destAddress: evmAddress, destAccount: evmRecipient },
      {
        sourceChain: hydration,
        sourceAsset: usdc,
        destinationChain: base,
        destinationAsset: usdc,
      },
    )
    expect(next.destAddress).toBe(evmAddress)
    expect(next.destAccount).toBe(evmRecipient)
    expect(next.srcAmount).toBe("")
  })
})

import { encodeFunctionData, getAbiItem } from "viem"
import { describe, expect, it } from "vitest"

import {
  poolAbi,
  uiIncentiveDataProviderAbi,
  uiPoolDataProviderAbi,
  walletBalanceProviderAbi,
} from "@/core/abi"

const names = (abi: readonly { type: string; name?: string }[]) =>
  abi.filter((item) => item.type === "function").map((item) => item.name)

describe("abi", () => {
  it("declares exactly the functions each contract is read or written through", () => {
    expect(names(uiPoolDataProviderAbi)).toEqual([
      "getReservesData",
      "getUserReservesData",
      "getReservesList",
    ])
    expect(names(uiIncentiveDataProviderAbi)).toEqual([
      "getReservesIncentivesData",
      "getUserReservesIncentivesData",
    ])
    expect(names(walletBalanceProviderAbi)).toEqual(["getUserWalletBalances"])
    expect(names(poolAbi)).toEqual([
      "supply",
      "withdraw",
      "borrow",
      "repay",
      "repayWithATokens",
      "setUserUseReserveAsCollateral",
      "setUserEMode",
      "getReserveData",
    ])
  })

  it("declares no stable-rate pool function", () => {
    const stableRate = names(poolAbi).filter(
      (name) => name === "swapBorrowRateMode" || /[Ss]table/.test(name ?? ""),
    )
    expect(stableRate).toEqual([])
  })

  it("encodes a pool call, proving the shapes are viem-native", () => {
    const calldata = encodeFunctionData({
      abi: poolAbi,
      functionName: "setUserEMode",
      args: [1],
    })
    // setUserEMode(uint8) selector, then categoryId 1 padded to a word.
    expect(calldata).toBe("0x28530a47" + "1".padStart(64, "0"))
  })

  it("keeps the stable-rate struct fields the contract still returns", () => {
    const item = getAbiItem({
      abi: uiPoolDataProviderAbi,
      name: "getReservesData",
    })
    const reserve = item.outputs[0]
    expect(reserve.components.map((c) => c.name)).toContain("stableBorrowRate")
  })
})

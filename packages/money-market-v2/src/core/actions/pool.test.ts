import type { Address } from "viem"
import { decodeFunctionData, encodeFunctionData } from "viem"
import { describe, expect, it } from "vitest"

import {
  buildBorrow,
  buildRepay,
  buildRepayWithATokens,
  buildSetUsageAsCollateral,
  buildSetUserEMode,
  buildSupply,
  buildWithdraw,
  getMarket,
  MAX_UINT_AMOUNT,
} from "@/core"
import { poolAbi } from "@/core/abi"
import type { ActionPlan } from "@/types"

const market = getMarket("hydration_v3")
const asset = "0x0000000000000000000000000000000000000222" as Address
const user = "0x0000000000000000000000000000000000000111" as Address
const other = "0x0000000000000000000000000000000000000333" as Address

const amount = 1_500_000n

/** The single call a plan of one holds, so a test can speak about it. */
const only = (plan: ActionPlan) => {
  const [call, ...rest] = plan
  expect(rest).toEqual([])
  if (!call) throw new Error("plan is empty")
  return call
}

describe("pool actions", () => {
  it("sends every action to the market's pool", () => {
    const plans = [
      buildSupply({ market, asset, amount, onBehalfOf: user }),
      buildWithdraw({ market, asset, amount, to: user }),
      buildBorrow({ market, asset, amount, onBehalfOf: user }),
      buildRepay({ market, asset, amount, onBehalfOf: user }),
      buildRepayWithATokens({ market, asset, amount }),
      buildSetUsageAsCollateral({ market, asset, useAsCollateral: true }),
      buildSetUserEMode({ market, categoryId: 1 }),
    ]

    for (const plan of plans) {
      expect(only(plan).to).toBe(market.addresses.POOL)
    }
  })

  it("encodes a supply with no referral code", () => {
    const call = only(buildSupply({ market, asset, amount, onBehalfOf: user }))

    expect(call.functionName).toBe("supply")
    expect(call.args).toEqual([asset, amount, user, 0])
    expect(call.data).toBe(
      encodeFunctionData({
        abi: poolAbi,
        functionName: "supply",
        args: [asset, amount, user, 0],
      }),
    )
  })

  it("encodes a withdraw to whoever receives the underlying", () => {
    const call = only(buildWithdraw({ market, asset, amount, to: other }))

    expect(call.data).toBe(
      encodeFunctionData({
        abi: poolAbi,
        functionName: "withdraw",
        args: [asset, amount, other],
      }),
    )
  })

  it("encodes a borrow at the variable rate mode", () => {
    const call = only(buildBorrow({ market, asset, amount, onBehalfOf: user }))

    expect(call.data).toBe(
      encodeFunctionData({
        abi: poolAbi,
        functionName: "borrow",
        args: [asset, amount, 2n, 0, user],
      }),
    )
  })

  it("encodes a repay at the variable rate mode", () => {
    const call = only(buildRepay({ market, asset, amount, onBehalfOf: other }))

    expect(call.data).toBe(
      encodeFunctionData({
        abi: poolAbi,
        functionName: "repay",
        args: [asset, amount, 2n, other],
      }),
    )
  })

  it("encodes a repay with aTokens, which names no beneficiary", () => {
    const call = only(buildRepayWithATokens({ market, asset, amount }))

    expect(call.args).toEqual([asset, amount, 2n])
    expect(call.data).toBe(
      encodeFunctionData({
        abi: poolAbi,
        functionName: "repayWithATokens",
        args: [asset, amount, 2n],
      }),
    )
  })

  it("encodes both directions of the collateral switch", () => {
    for (const useAsCollateral of [true, false]) {
      const call = only(
        buildSetUsageAsCollateral({ market, asset, useAsCollateral }),
      )
      expect(call.data).toBe(
        encodeFunctionData({
          abi: poolAbi,
          functionName: "setUserUseReserveAsCollateral",
          args: [asset, useAsCollateral],
        }),
      )
    }
  })

  it("encodes leaving e-mode as category zero", () => {
    const call = only(buildSetUserEMode({ market, categoryId: 0 }))

    expect(call.data).toBe(
      encodeFunctionData({
        abi: poolAbi,
        functionName: "setUserEMode",
        args: [0],
      }),
    )
  })

  it("passes the max sentinel through instead of resolving a balance", () => {
    const call = only(
      buildSupply({ market, asset, amount: MAX_UINT_AMOUNT, onBehalfOf: user }),
    )

    expect(MAX_UINT_AMOUNT).toBe(2n ** 256n - 1n)
    expect(call.args[1]).toBe(MAX_UINT_AMOUNT)
    // The sentinel reaches the calldata whole, rather than as some balance.
    expect(call.data).toContain("f".repeat(64))
  })

  it("carries only the ABI item it encoded, so the calldata decodes from it", () => {
    const call = only(buildBorrow({ market, asset, amount, onBehalfOf: user }))

    expect(call.abi).toHaveLength(1)
    expect(decodeFunctionData({ abi: call.abi, data: call.data })).toEqual({
      functionName: "borrow",
      args: [asset, amount, 2n, 0, user],
    })
  })

  it("defaults a gas limit per action", () => {
    const limits = [
      [buildSupply({ market, asset, amount, onBehalfOf: user }), 1_000_000n],
      [buildWithdraw({ market, asset, amount, to: user }), 1_000_000n],
      [buildBorrow({ market, asset, amount, onBehalfOf: user }), 1_300_000n],
      [buildRepay({ market, asset, amount, onBehalfOf: user }), 1_000_000n],
      [buildRepayWithATokens({ market, asset, amount }), 1_000_000n],
      [
        buildSetUsageAsCollateral({ market, asset, useAsCollateral: true }),
        1_000_000n,
      ],
      [buildSetUserEMode({ market, categoryId: 1 }), 1_000_000n],
    ] as const

    for (const [plan, gasLimit] of limits) {
      expect(only(plan).gasLimit).toBe(gasLimit)
    }
  })

  it("lets a caller's gas hints override the default", () => {
    const gas = { gasLimit: 500_000n, maxFeePerGas: 7n }

    expect(
      only(buildBorrow({ market, asset, amount, onBehalfOf: user, gas })),
    ).toMatchObject(gas)
    expect(
      only(
        buildBorrow({
          market,
          asset,
          amount,
          onBehalfOf: user,
          gas: { maxFeePerGas: 7n },
        }),
      ),
    ).toMatchObject({ gasLimit: 1_300_000n, maxFeePerGas: 7n })
  })
})

describe("isolation join", () => {
  const collateralA = "0x0000000000000000000000000000000000000444" as Address
  const collateralB = "0x0000000000000000000000000000000000000555" as Address

  const plan = buildSupply({
    market,
    asset,
    amount,
    onBehalfOf: user,
    isolationJoin: { disableCollateral: [collateralA, collateralB] },
  })

  it("disables the other collateral, supplies, then enables the asset", () => {
    expect(
      plan.map((call) =>
        decodeFunctionData({ abi: call.abi, data: call.data }),
      ),
    ).toEqual([
      {
        functionName: "setUserUseReserveAsCollateral",
        args: [collateralA, false],
      },
      {
        functionName: "setUserUseReserveAsCollateral",
        args: [collateralB, false],
      },
      { functionName: "supply", args: [asset, amount, user, 0] },
      { functionName: "setUserUseReserveAsCollateral", args: [asset, true] },
    ])
  })

  it("sends every call to the pool with its default gas limit", () => {
    for (const call of plan) {
      expect(call.to).toBe(market.addresses.POOL)
      expect(call.gasLimit).toBe(1_000_000n)
    }
  })

  it("applies a caller's gas hints to every call", () => {
    const withGas = buildSupply({
      market,
      asset,
      amount,
      onBehalfOf: user,
      isolationJoin: { disableCollateral: [collateralA] },
      gas: { gasLimit: 800_000n },
    })

    expect(withGas).toHaveLength(3)
    for (const call of withGas) expect(call.gasLimit).toBe(800_000n)
  })

  it("is a plain supply without a join", () => {
    expect(
      only(buildSupply({ market, asset, amount, onBehalfOf: user }))
        .functionName,
    ).toBe("supply")
  })
})

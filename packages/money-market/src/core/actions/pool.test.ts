import type { Address } from "viem"
import { decodeFunctionData } from "viem"
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
} from "@/core"
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

  it.each([
    [
      "a supply with no referral code",
      buildSupply({ market, asset, amount, onBehalfOf: user }),
      "supply",
      [asset, amount, user, 0],
    ],
    [
      "a withdraw to whoever receives the underlying",
      buildWithdraw({ market, asset, amount, to: other }),
      "withdraw",
      [asset, amount, other],
    ],
    [
      "a borrow at the variable rate mode",
      buildBorrow({ market, asset, amount, onBehalfOf: user }),
      "borrow",
      [asset, amount, 2n, 0, user],
    ],
    [
      "a repay at the variable rate mode",
      buildRepay({ market, asset, amount, onBehalfOf: other }),
      "repay",
      [asset, amount, 2n, other],
    ],
    [
      "a repay with aTokens, which names no beneficiary",
      buildRepayWithATokens({ market, asset, amount }),
      "repayWithATokens",
      [asset, amount, 2n],
    ],
    [
      "a collateral switch",
      buildSetUsageAsCollateral({ market, asset, useAsCollateral: false }),
      "setUserUseReserveAsCollateral",
      [asset, false],
    ],
    [
      "leaving e-mode as category zero",
      buildSetUserEMode({ market, categoryId: 0 }),
      "setUserEMode",
      [0],
    ],
  ] as const)("encodes %s", (_, plan, functionName, args) => {
    const call = only(plan)

    // Decoded with only the ABI item the call carries.
    expect(call.abi).toHaveLength(1)
    expect(decodeFunctionData({ abi: call.abi, data: call.data })).toEqual({
      functionName,
      args,
    })
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
})

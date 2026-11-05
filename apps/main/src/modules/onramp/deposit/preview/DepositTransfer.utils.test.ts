import { describe, expect, it } from "vitest"

import type { DepositBalanceRow } from "@/modules/onramp/deposit/DepositDiscovery.utils"
import {
  getDepositExpectedDuration,
  getDepositFeeReserve,
  getDepositReceivedAsset,
  getDepositSourceFormValues,
  getDepositTiming,
  getDepositTokenProvenance,
} from "@/modules/onramp/deposit/preview/DepositTransfer.utils"
import type { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

describe("deposit transfer presentation", () => {
  it("keeps Wormhole and Snowbridge arriving tokens distinct, including automatic execution", () => {
    expect(getDepositTokenProvenance("Wormhole")).toBe("wormhole")
    expect(getDepositTokenProvenance("NttExecutor")).toBe("wormhole")
    expect(getDepositTokenProvenance("Basejump")).toBe("wormhole")
    expect(getDepositTokenProvenance("Snowbridge")).toBe("snowbridge")
    expect(getDepositTokenProvenance("SnowbridgeV1")).toBe("snowbridge")
    expect(getDepositTokenProvenance(null)).toBeNull()
  })
  it("shows only a positive reserve derived from the actual SDK Max", () => {
    expect(getDepositFeeReserve("1", "0.99825")).toBe("0.00175")
    expect(
      getDepositFeeReserve(
        "1234567890.123456789123456789",
        "1234567890.123456789123456788",
      ),
    ).toBe("1e-18")
    expect(getDepositFeeReserve("100", "100")).toBeUndefined()
    expect(getDepositFeeReserve("100", "101")).toBeUndefined()
    expect(getDepositFeeReserve("1", "-1")).toBeUndefined()
    expect(getDepositFeeReserve(undefined, "1")).toBeUndefined()
    expect(getDepositFeeReserve("not available", "1")).toBeUndefined()
  })
  it("only delays after twice a real route estimate and never invents one for an unknown route", () => {
    const duration = getDepositExpectedDuration("≈ 20 min")
    expect(duration).toBe(1200000)
    expect(getDepositExpectedDuration("≈ 10 sec")).toBe(10000)
    expect(getDepositExpectedDuration(undefined)).toBeUndefined()
    expect(getDepositExpectedDuration("unavailable")).toBeUndefined()
    expect(getDepositTiming(1000, 2400999, duration).delayed).toBe(false)
    expect(getDepositTiming(1000, 2401000, duration).delayed).toBe(true)
    expect(getDepositTiming(1000, 99999999).delayed).toBe(false)
    expect(getDepositTiming(2000, 1000, duration).elapsed).toBe(0)
    expect(getDepositTiming(1000, 2401000, duration).remaining).toBe(0)
  })
  it("uses the destination receipt amount, not the amount sent or an intermediate token", () => {
    const destination = "urn:ocn:polkadot:2034"
    const assets = [
      {
        asset: "urn:ocn:ethereum:1|usdc",
        symbol: "USDC",
        amount: "100000000",
        decimals: 6,
        role: "transfer" as const,
        sequence: 1,
      },
      {
        asset: "urn:ocn:polkadot:1000|usdc",
        symbol: "USDC",
        amount: "99900000",
        decimals: 6,
        role: "transfer" as const,
        sequence: 2,
      },
      {
        asset: `${destination}|usdc`,
        symbol: "USDC",
        amount: "99800000",
        decimals: 6,
        role: "transfer" as const,
        sequence: 3,
      },
      {
        asset: `${destination}|hdx`,
        symbol: "HDX",
        amount: "1",
        decimals: 12,
        role: "fee" as const,
        sequence: 4,
      },
    ]
    expect(getDepositReceivedAsset({ destination, assets })).toEqual({
      amount: "99.8",
      symbol: "USDC",
    })
    expect(
      getDepositReceivedAsset({ destination, assets: assets.slice(0, 2) }),
    ).toBeUndefined()
    expect(
      getDepositReceivedAsset({
        destination,
        assets: [{ ...assets[2]!, amount: "invalid" }],
      }),
    ).toBeUndefined()
    expect(
      getDepositReceivedAsset({
        destination,
        assets: [{ ...assets[2]!, decimals: undefined }],
      }),
    ).toBeUndefined()
  })
  it("changes funded chains without losing the confirmed recipient or keeping stale route values", () => {
    const receiver = { name: "Hydration receiver" }
    const values = {
      srcChain: { key: "ethereum" },
      srcAsset: { key: "usdc", originSymbol: "USDC" },
      srcAmount: "250",
      destChain: { key: "hydration" },
      destAsset: { key: "usdc_mwh", originSymbol: "USDC" },
      destAddress: "confirmed-receiver",
      destAccount: receiver,
      destAmount: "249",
      bridgeProvider: "Wormhole",
    } as XcmFormValues
    const row = {
      source: { chain: { key: "base" } },
      balance: { key: "usdc", originSymbol: "USDC" },
    } as DepositBalanceRow
    const next = getDepositSourceFormValues(values, row)
    expect(next.srcAmount).toBe("250")
    expect(next.srcChain).toBe(row.source.chain)
    expect(next.destAccount).toBe(receiver)
    expect(next.destAddress).toBe("confirmed-receiver")
    expect(next.destAsset).toBeNull()
    expect(next.destAmount).toBe("")
    expect(next.bridgeProvider).toBeNull()
    const differentToken = {
      ...row,
      balance: { ...row.balance, key: "usdc_mwh" },
    } as DepositBalanceRow
    expect(getDepositSourceFormValues(values, differentToken).srcAmount).toBe(
      "",
    )
  })
})

import { describe, expect, it } from "vitest"

import { type AnyPapiTx } from "@/modules/transactions/types"
import { type Papi } from "@/providers/rpcProvider"

import { composeVaultBatch } from "./batch"

type Call = AnyPapiTx["decodedCall"]

const binding = {
  type: "EVMAccounts",
  value: { type: "bind_evm_address", value: undefined },
}
const trade = { type: "Router", value: { type: "sell", value: {} } }
const approve = { type: "EVM", value: { type: "call", value: { n: 1 } } }
const deposit = { type: "EVM", value: { type: "call", value: { n: 2 } } }
const dispatched = (call: unknown) => ({
  type: "Dispatcher",
  value: { type: "dispatch_evm_call", value: { call } },
})
const papi = {
  tx: {
    EVMAccounts: { bind_evm_address: () => ({ decodedCall: binding }) },
    Dispatcher: {
      dispatch_evm_call: ({ call }: { call: unknown }) => ({
        decodedCall: dispatched(call),
      }),
    },
  },
} as unknown as Papi
const calls = (...items: unknown[]) => items as Call[]

describe("Vault batch composition", () => {
  it("keeps plain EVM calls, after the binding an unmapped account needs", () => {
    expect(
      composeVaultBatch(papi, { bind: true, evmCalls: calls(approve) }),
    ).toEqual([binding, approve])
    expect(
      composeVaultBatch(papi, { bind: false, evmCalls: calls(approve) }),
    ).toEqual([approve])
  })

  it("runs the trade before the approval and deposit it funds, each able to fail the batch", () => {
    expect(
      composeVaultBatch(papi, {
        bind: true,
        leading: calls(trade),
        evmCalls: calls(approve, deposit),
        atomic: true,
      }),
    ).toEqual([binding, trade, dispatched(approve), dispatched(deposit)])
  })
  it("sells after the EVM calls, leaving the trade outside the atomic wrap", () => {
    expect(
      composeVaultBatch(papi, {
        bind: true,
        leading: calls(trade),
        evmCalls: calls(approve, deposit),
        trailing: calls(trade),
        atomic: true,
      }),
    ).toEqual([binding, trade, dispatched(approve), dispatched(deposit), trade])
  })
})

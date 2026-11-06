import { describe, expect, it, vi } from "vitest"

import { type AnyPapiTx } from "@/modules/transactions/types"
import { type Papi } from "@/providers/rpcProvider"

import {
  containsEvmCall,
  getNestedEvmCallsFeeWei,
  prependEvmBindingTx,
} from "./tx"

vi.mock("@/api/evm", () => ({ weightToEvmFeeQuery: vi.fn() }))
vi.mock("@/api/transaction", () => ({ paymentInfoQuery: vi.fn() }))
vi.mock(
  "@/modules/transactions/review/ReviewTransactionJsonView/ReviewTransactionJsonView.utils",
  () => ({ decodeTx: vi.fn() }),
)
vi.mock("@/api/external/common", () => ({
  getParachainFeeAssetLocation: vi.fn(),
}))

const binding = {
  type: "EVMAccounts",
  value: { type: "bind_evm_address", value: undefined },
}
const call = { type: "EVM", value: { type: "call", value: {} } }
const batch = (calls: unknown[]) =>
  ({
    decodedCall: {
      type: "Utility",
      value: { type: "batch_all", value: { calls } },
    },
  }) as unknown as AnyPapiTx
const setup = () => {
  const batchAll = vi.fn(({ calls }: { calls: unknown[] }) => batch(calls))
  const bind = vi.fn(() => ({ decodedCall: binding }))
  const papi = {
    tx: {
      Utility: { batch_all: batchAll },
      EVMAccounts: { bind_evm_address: bind },
    },
  } as unknown as Papi
  return { papi, batchAll, bind }
}

describe("Native EVM binding composition", () => {
  it("adds binding before a plain call", () => {
    const { papi, batchAll } = setup()
    prependEvmBindingTx(papi, { decodedCall: call } as unknown as AnyPapiTx)
    expect(batchAll).toHaveBeenCalledWith({ calls: [binding, call] })
  })

  it("keeps an existing batch flat and puts binding first", () => {
    const { papi, batchAll } = setup()
    prependEvmBindingTx(papi, batch([call, call]))
    expect(batchAll).toHaveBeenCalledWith({ calls: [binding, call, call] })
  })

  it("does not bind a fresh Propeller wallet twice when its approval already includes binding", () => {
    const { papi, batchAll } = setup()
    const preparedApproval = batch([binding, call])
    expect(prependEvmBindingTx(papi, preparedApproval)).toBe(preparedApproval)
    expect(batchAll).not.toHaveBeenCalled()
  })
})

describe("nested EVM calls", () => {
  const evmCall = {
    type: "EVM",
    value: {
      type: "call",
      value: { gas_limit: 10n, max_fee_per_gas: [3n, 0n, 0n, 0n] },
    },
  }
  const dispatched = {
    type: "Dispatcher",
    value: { type: "dispatch_evm_call", value: { call: evmCall } },
  }
  const trade = { type: "Router", value: { type: "buy", value: {} } }
  const asTx = (decodedCall: unknown) =>
    ({
      decodedCall,
      signSubmitAndWatch: vi.fn(),
    }) as unknown as AnyPapiTx
  const batchOf = (calls: unknown[]) => ({
    type: "Utility",
    value: { type: "batch_all", value: { calls } },
  })

  it("sees an EVM call inside dispatch_evm_call, alone or in a batch", () => {
    expect(containsEvmCall(asTx(dispatched))).toBe(true)
    expect(containsEvmCall(asTx(batchOf([trade, dispatched])))).toBe(true)
  })

  it("does not see one where there is none", () => {
    expect(containsEvmCall(asTx(batchOf([trade])))).toBe(false)
  })

  it("collects each dispatched call's gas", () => {
    expect(
      getNestedEvmCallsFeeWei(asTx(batchOf([trade, dispatched, dispatched]))),
    ).toBe(60n)
  })
})

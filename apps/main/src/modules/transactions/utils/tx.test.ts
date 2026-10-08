import { describe, expect, it, vi } from "vitest"

import { type AnyPapiTx } from "@/modules/transactions/types"
import { type Papi } from "@/providers/rpcProvider"

import { prependEvmBindingTx } from "./tx"

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

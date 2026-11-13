import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@galacticcouncil/web3-connect", () => ({
  isEthereumSigner: (s: unknown) =>
    !!s && (s as { __eth?: boolean }).__eth === true,
}))

import { TxOptions } from "@/modules/transactions/types"
import {
  canPresentStrict,
  getStrictEvmRefusal,
  getStrictStatusView,
  getStrictWrapRefusal,
  signAndSubmitStrictEvmTx,
  strictEvmCall,
  strictEvmDigest,
  useStrictEvmLedger,
} from "@/modules/transactions/utils/strictEvm"
import { SingleTransaction, StrictEvmOptions } from "@/states/transactions"

const A = "0x00000000000000000000000000000000000000a1"
const HASH = `0x${"ab".repeat(32)}`
const approve = {
  chainId: 222222,
  from: A,
  to: "0x00000000000000000000000000000000000000b2",
  data: "0x095ea7b3",
  value: "0x0",
}
const redeem = {
  ...approve,
  data: "0xabcdef01",
  to: "0x00000000000000000000000000000000000000c3",
}

type Script =
  | { kind: "refused"; reason: string }
  | { kind: "rejected" }
  | { kind: "failed"; code: number | null }
  | { kind: "sent"; receipt: "success" | "reverted" | "unknown" }

/** A stand-in EthereumSigner whose prepared send follows a script, calling back as the real one. */
const fakeSigner = (script: Script[], address = A) => {
  const calls: unknown[] = []
  return {
    __eth: true,
    address,
    calls,
    getPermit: vi.fn(),
    signAndSubmit: vi.fn(),
    signAndSubmitDispatch: vi.fn(),
    sendPreparedTransaction: vi.fn(
      async (
        prepared: unknown,
        o: {
          onPrompt: () => void
          onReceipt: (s: string) => void
          onSubmitted: (h: string) => void
          onSuccess: (r: unknown) => void
          onError: (m: string) => void
        },
      ) => {
        calls.push(prepared)
        const step = script.shift() ?? { kind: "failed", code: null }
        if (step.kind === "refused") {
          o.onError("refused")
          return step
        }
        o.onPrompt()
        if (step.kind === "rejected" || step.kind === "failed") {
          o.onError(step.kind)
          return step
        }
        o.onSubmitted(HASH)
        o.onReceipt(step.receipt)
        if (step.receipt === "success") o.onSuccess({ status: "success" })
        else o.onError("receipt")
        return { kind: "sent", hash: HASH, receipt: step.receipt }
      },
    ),
  }
}

const strictTx = (
  prepared = redeem,
  extra: Partial<StrictEvmOptions> = {},
): SingleTransaction =>
  ({
    id: "t1",
    meta: { type: "Onchain", srcChainKey: "hydration" },
    tx: strictEvmCall(prepared),
    strictEvm: {
      prepared,
      sessionAddress: A,
      wrapRefusal: null,
      ...extra,
    },
  }) as unknown as SingleTransaction

const txOptions = (feeAssetId = "0") => {
  const order: string[] = []
  const options = {
    chainKey: "hydration",
    feeAssetId,
    mortalityPeriod: 512,
    onSubmitted: vi.fn((h: string) => order.push(`submitted:${h}`)),
    onSuccess: vi.fn(() => order.push("success")),
    onError: vi.fn((m: string) => order.push(`error:${m}`)),
    onFinalized: vi.fn(),
  } as unknown as TxOptions & { onError: ReturnType<typeof vi.fn> }
  return { options, order }
}

const state = (prepared = redeem) =>
  useStrictEvmLedger.getState().entries[strictEvmDigest(prepared)]

beforeEach(() => useStrictEvmLedger.setState({ entries: {} }))

describe("strict send: once (guarantee 5)", () => {
  it("4001 with no hash: the SAME tx may be presented again, once per decline", async () => {
    const signer = fakeSigner([
      { kind: "rejected" },
      { kind: "sent", receipt: "success" },
    ])
    const tx = strictTx()
    await signAndSubmitStrictEvmTx(tx, signer, txOptions().options)
    expect(state()).toBe("rejected")
    expect(canPresentStrict(state())).toBe(true)
    await signAndSubmitStrictEvmTx(tx, signer, txOptions().options)
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(2)
    expect(signer.calls[0]).toBe(signer.calls[1])
    expect(state()).toBe("succeeded")
  })

  it.each([
    ["a non-4001 error", { kind: "failed", code: -32603 } as Script, "failed"],
    ["a wallet timeout", { kind: "failed", code: null } as Script, "failed"],
    [
      "a returned hash",
      { kind: "sent", receipt: "success" } as Script,
      "succeeded",
    ],
    ["a revert", { kind: "sent", receipt: "reverted" } as Script, "reverted"],
    [
      "a receipt wait that throws",
      { kind: "sent", receipt: "unknown" } as Script,
      "unknown",
    ],
    [
      "a refusal before the prompt",
      { kind: "refused", reason: "estimate" } as Script,
      "refused",
    ],
  ])(
    "%s is final: the signer is never called again",
    async (_name, step, final) => {
      const signer = fakeSigner([step, { kind: "sent", receipt: "success" }])
      const tx = strictTx()
      await signAndSubmitStrictEvmTx(tx, signer, txOptions().options)
      expect(state()).toBe(final)
      const second = txOptions()
      await signAndSubmitStrictEvmTx(tx, signer, second.options)
      expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
      expect(second.options.onError).toHaveBeenCalledTimes(1)
      expect(state()).toBe(final)
    },
  )

  it("the same calldata in a new object is the same prepared tx", async () => {
    const signer = fakeSigner([{ kind: "failed", code: null }])
    await signAndSubmitStrictEvmTx(strictTx(), signer, txOptions().options)
    await signAndSubmitStrictEvmTx(
      strictTx({ ...redeem, from: A.toUpperCase().replace("0X", "0x") }),
      signer,
      txOptions().options,
    )
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
  })

  it("an error reaches the pipeline only after the ledger holds its outcome", async () => {
    const signer = fakeSigner([{ kind: "rejected" }])
    const { options } = txOptions()
    options.onError = vi.fn(() => expect(state()).toBe("rejected"))
    await signAndSubmitStrictEvmTx(strictTx(), signer, options)
    expect(options.onError).toHaveBeenCalledTimes(1)
  })

  it("status view: Try again only after a decline", () => {
    expect(getStrictStatusView("rejected")).toBe("declined")
    expect(getStrictStatusView("refused")).toBe("notSent")
    for (const s of [
      undefined,
      "claimed",
      "prompted",
      "failed",
      "sent",
      "succeeded",
      "reverted",
      "unknown",
    ] as const)
      expect(getStrictStatusView(s)).toBe("checking")
  })
})

describe("strict send: refusals before the prompt", () => {
  const refusedWith = async (tx: SingleTransaction, signer: unknown) => {
    const { options } = txOptions()
    await signAndSubmitStrictEvmTx(tx, signer, options)
    return options
  }

  it("guarantee 1: a Polkadot signer is refused before any wallet call", async () => {
    const polkadot = { __eth: false, signAndSubmit: vi.fn(), address: A }
    const options = await refusedWith(strictTx(), polkadot)
    expect(polkadot.signAndSubmit).not.toHaveBeenCalled()
    expect(options.onError).toHaveBeenCalledTimes(1)
    expect(state()).toBe("refused")
  })

  it("guarantee 2: a stamped wrap refusal, or no stamp at all, refuses", async () => {
    for (const wrapRefusal of [
      "unbound",
      "multisig",
      "pending",
      undefined,
    ] as const) {
      useStrictEvmLedger.setState({ entries: {} })
      const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
      const tx = strictTx(redeem, { wrapRefusal })
      if (wrapRefusal === undefined) delete tx.strictEvm!.wrapRefusal
      await refusedWith(tx, signer)
      expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
      expect(state()).toBe("refused")
    }
  })

  it("guarantee 2/4: a tx that is not the unchanged prepared call refuses (wrapped or edited)", async () => {
    const edits: Record<string, unknown>[] = [
      { tx: { decodedCall: {} } },
      { tx: { ...strictEvmCall(redeem), data: "0xabcdef02" } },
      { tx: { ...strictEvmCall(redeem), to: approve.to } },
      { tx: { ...strictEvmCall(redeem), value: 1n } },
    ]
    for (const edit of edits) {
      useStrictEvmLedger.setState({ entries: {} })
      const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
      await refusedWith({ ...strictTx(), ...edit } as SingleTransaction, signer)
      expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
    }
  })

  it("guarantee 3: from must equal the session H160 and the signer's address", async () => {
    const other = "0x00000000000000000000000000000000000000d4"
    const cases: [SingleTransaction, ReturnType<typeof fakeSigner>][] = [
      [strictTx(redeem, { sessionAddress: other }), fakeSigner([])],
      [strictTx(), fakeSigner([], other)],
    ]
    for (const [tx, signer] of cases) {
      useStrictEvmLedger.setState({ entries: {} })
      await refusedWith(tx, signer)
      expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
    }
    expect(
      getStrictEvmRefusal(
        strictTx(redeem, {
          sessionAddress: A.toUpperCase().replace("0X", "0x"),
        }),
        fakeSigner([]),
        0,
      ),
    ).toBeNull()
  })

  it("guarantee 6: the redeem waits for the approve's successful receipt", async () => {
    for (const approveState of [
      undefined,
      "sent",
      "reverted",
      "unknown",
      "failed",
    ] as const) {
      useStrictEvmLedger.setState({
        entries: approveState
          ? { [strictEvmDigest(approve)]: approveState }
          : {},
      })
      const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
      await refusedWith(strictTx(redeem, { after: approve }), signer)
      expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
    }
    useStrictEvmLedger.setState({
      entries: { [strictEvmDigest(approve)]: "succeeded" },
    })
    const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
    await refusedWith(strictTx(redeem, { after: approve }), signer)
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
  })

  it("notAfter: refused from the deadline on", () => {
    const tx = strictTx(redeem, { notAfter: 1_000 })
    expect(getStrictEvmRefusal(tx, fakeSigner([]), 999)).toBeNull()
    expect(getStrictEvmRefusal(tx, fakeSigner([]), 1_000)).toBe("expired")
  })

  it("useWrapTransaction's stamp: multisig, then a pending binding, then unbound", () => {
    expect(
      getStrictWrapRefusal({
        isMultisig: true,
        isLoadingBinding: false,
        isBound: true,
      }),
    ).toBe("multisig")
    expect(
      getStrictWrapRefusal({
        isMultisig: false,
        isLoadingBinding: true,
        isBound: undefined,
      }),
    ).toBe("pending")
    expect(
      getStrictWrapRefusal({
        isMultisig: false,
        isLoadingBinding: false,
        isBound: false,
      }),
    ).toBe("unbound")
    expect(
      getStrictWrapRefusal({
        isMultisig: false,
        isLoadingBinding: false,
        isBound: true,
      }),
    ).toBeNull()
  })
})

describe("strict send: hash out (guarantee 7) and the route (guarantee 1)", () => {
  it("onHash gets the hash before the receipt is reported", async () => {
    const order: string[] = []
    const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
    const { options } = txOptions()
    options.onSuccess = vi.fn(() => order.push("success"))
    await signAndSubmitStrictEvmTx(
      strictTx(redeem, { onHash: (h) => order.push(`hash:${h}`) }),
      signer,
      options,
    )
    expect(order).toEqual([`hash:${HASH}`, "success"])
  })

  it.each(["0", "5", "20"])(
    "fee asset %s: only the prepared send, never a permit or the dispatch precompile",
    async (fee) => {
      const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
      await signAndSubmitStrictEvmTx(strictTx(), signer, txOptions(fee).options)
      expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(1)
      expect(signer.sendPreparedTransaction.mock.calls[0]![0]).toBe(redeem)
      expect(signer.getPermit).not.toHaveBeenCalled()
      expect(signer.signAndSubmit).not.toHaveBeenCalled()
      expect(signer.signAndSubmitDispatch).not.toHaveBeenCalled()
    },
  )
})

describe("strict send: memory only (guarantee 8)", () => {
  it("the ledger holds digests and states, never a field of the transaction", async () => {
    const signer = fakeSigner([{ kind: "failed", code: null }])
    await signAndSubmitStrictEvmTx(strictTx(), signer, txOptions().options)
    const dump = JSON.stringify(useStrictEvmLedger.getState().entries)
    expect(dump).not.toContain(redeem.data.slice(2))
    expect(dump).not.toContain(redeem.to.slice(2))
  })
})

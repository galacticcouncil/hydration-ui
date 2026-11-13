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
const SCOPE = "00000000-0000-4000-8000-0000000000d1"
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
        // as the real signer: mined only for an observed receipt
        if (step.receipt !== "unknown")
          (o as unknown as { onMined: (h: string, s: string) => void }).onMined(
            HASH,
            step.receipt,
          )
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
      scope: SCOPE,
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
  useStrictEvmLedger.getState().entries[strictEvmDigest(prepared, SCOPE)]

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
    expect(getStrictEvmRefusal(strictTx(), polkadot, 0)).toBe("signer")
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
          ? { [strictEvmDigest(approve, SCOPE)]: approveState }
          : {},
      })
      const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
      await refusedWith(strictTx(redeem, { after: approve }), signer)
      expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
    }
    useStrictEvmLedger.setState({
      entries: { [strictEvmDigest(approve, SCOPE)]: "succeeded" },
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
  it("onMined gets the hash only after the receipt, never at onSubmitted", async () => {
    const order: string[] = []
    const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
    const { options } = txOptions()
    options.onSubmitted = vi.fn(() => order.push("submitted"))
    options.onSuccess = vi.fn(() => order.push("success"))
    await signAndSubmitStrictEvmTx(
      strictTx(redeem, { onMined: (h) => order.push(`mined:${h}`) }),
      signer,
      options,
    )
    expect(order).toEqual(["submitted", "success", `mined:${HASH}`])
  })

  it("a hash whose receipt is not observed is never handed out", async () => {
    const hashes: string[] = []
    const signer = fakeSigner([{ kind: "sent", receipt: "unknown" }])
    await signAndSubmitStrictEvmTx(
      strictTx(redeem, { onMined: (h) => hashes.push(h) }),
      signer,
      txOptions().options,
    )
    expect(hashes).toEqual([])
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

describe("fix round 1 (review 3)", () => {
  it("B-1 / C1: two concurrent sends against a signer that awaits before the prompt reach the wallet ONCE", async () => {
    let sends = 0
    const signer = {
      __eth: true,
      address: A,
      sendPreparedTransaction: vi.fn(
        async (
          _p: unknown,
          o: { onPrompt: () => void; onError: (m: string) => void },
        ) => {
          // the real signer awaits six reads before the prompt
          await new Promise((r) => setTimeout(r, 5))
          o.onPrompt()
          sends++
          o.onError("rejected")
          return { kind: "rejected" }
        },
      ),
    }
    const a = txOptions()
    const b = txOptions()
    await Promise.all([
      signAndSubmitStrictEvmTx(strictTx(), signer, a.options),
      signAndSubmitStrictEvmTx(strictTx(), signer, b.options),
    ])
    expect(sends).toBe(1)
    // the second click is silent while the first send runs (no Checking flash)
    expect(b.options.onError).not.toHaveBeenCalled()
  })

  it("B-1: an outcome the signer calls refused after the prompt fired is failed, never not sent", async () => {
    const signer = {
      __eth: true,
      address: A,
      sendPreparedTransaction: vi.fn(
        async (
          _p: unknown,
          o: { onPrompt: () => void; onError: (m: string) => void },
        ) => {
          o.onPrompt()
          o.onError("refused")
          return { kind: "refused", reason: "estimate" }
        },
      ),
    }
    await signAndSubmitStrictEvmTx(strictTx(), signer, txOptions().options)
    expect(state()).toBe("failed")
    expect(getStrictStatusView(state())).toBe("checking")
  })

  it("B-1: a callback that throws before the prompt is not read as not sent", async () => {
    const signer = {
      __eth: true,
      address: A,
      sendPreparedTransaction: vi.fn(async () => {
        throw new Error("callback threw")
      }),
    }
    await signAndSubmitStrictEvmTx(strictTx(), signer, txOptions().options)
    expect(state()).toBe("failed")
  })

  it("B-2: the same bytes in two scopes (two ramps) are two hand-overs; within one scope still once", async () => {
    const OTHER = "00000000-0000-4000-8000-00000000bb02"
    expect(strictEvmDigest(approve, SCOPE)).not.toBe(
      strictEvmDigest(approve, OTHER),
    )
    const signer = fakeSigner([
      { kind: "sent", receipt: "success" },
      { kind: "sent", receipt: "success" },
      { kind: "sent", receipt: "success" },
    ])
    await signAndSubmitStrictEvmTx(
      strictTx(approve),
      signer,
      txOptions().options,
    )
    await signAndSubmitStrictEvmTx(
      strictTx(approve, { scope: OTHER }),
      signer,
      txOptions().options,
    )
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(2)
    await signAndSubmitStrictEvmTx(
      strictTx(approve),
      signer,
      txOptions().options,
    )
    expect(signer.sendPreparedTransaction).toHaveBeenCalledTimes(2)
  })

  it("B-2: `after` is read in the transaction's own scope", () => {
    useStrictEvmLedger.setState({
      entries: { [strictEvmDigest(approve, "another-ramp")]: "succeeded" },
    })
    expect(
      getStrictEvmRefusal(
        strictTx(redeem, { after: approve }),
        fakeSigner([]),
        0,
      ),
    ).toBe("sequence")
  })

  it("a missing scope is refused before the prompt", async () => {
    const signer = fakeSigner([{ kind: "sent", receipt: "success" }])
    const tx = strictTx()
    ;(tx.strictEvm as { scope?: string }).scope = ""
    await signAndSubmitStrictEvmTx(tx, signer, txOptions().options)
    expect(signer.sendPreparedTransaction).not.toHaveBeenCalled()
  })

  it("a speed-up: only the final (replacement) hash, once mined", async () => {
    const hashes: string[] = []
    const H2 = `0x${"cd".repeat(32)}`
    const signer = {
      __eth: true,
      address: A,
      sendPreparedTransaction: vi.fn(
        async (
          _p: unknown,
          o: {
            onPrompt: () => void
            onSubmitted: (h: string) => void
            onRepriced: (h: string) => void
            onReceipt: (s: string) => void
            onSuccess: (r: unknown) => void
          },
        ) => {
          o.onPrompt()
          o.onSubmitted(HASH)
          o.onRepriced(H2)
          o.onReceipt("success")
          o.onSuccess({})
          ;(
            o as unknown as { onMined: (h: string, s: string) => void }
          ).onMined(H2, "success")
          return { kind: "sent", hash: H2, receipt: "success" }
        },
      ),
    }
    await signAndSubmitStrictEvmTx(
      strictTx(redeem, { onMined: (h) => hashes.push(h) }),
      signer,
      txOptions().options,
    )
    expect(hashes).toEqual([H2])
  })
})

import {
  NearTxCallbacks,
  reportNearSend,
} from "@galacticcouncil/web3-connect/src/utils/near"
import type { NearTxOutcome } from "@galacticcouncil/xc-core"
import type { NearTxObserver } from "@galacticcouncil/xc-sdk"
import { describe, expect, it, vi } from "vitest"

const outcome = {
  status: { SuccessValue: "" },
  transaction: { hash: "tx1", receiver_id: "ntt.near", signer_id: "a.near" },
  transaction_outcome: {
    id: "tx1",
    outcome: {
      executor_id: "a.near",
      gas_burnt: 1,
      logs: [],
      status: { SuccessReceiptId: "r1" },
      tokens_burnt: "0",
    },
  },
  receipts_outcome: [],
} satisfies NearTxOutcome

const callbacks = () =>
  ({
    onSubmitted: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onFinalized: vi.fn(),
  }) satisfies NearTxCallbacks

// Drives the observer the way the sdk signer does
const send =
  (run: (observer: NearTxObserver) => void) =>
  async (observer: NearTxObserver) =>
    run(observer)

describe("reportNearSend", () => {
  it("reports a settled transaction as a success", async () => {
    const cb = callbacks()

    const result = await reportNearSend(
      send((observer) => {
        observer.onTransactionSend("tx1")
        observer.onStatus?.(outcome)
      }),
      cb,
    )

    expect(result).toBe(outcome)
    expect(cb.onSubmitted).toHaveBeenCalledWith("tx1")
    expect(cb.onSuccess).toHaveBeenCalledWith(outcome)
    expect(cb.onFinalized).toHaveBeenCalledWith(outcome)
    expect(cb.onError).not.toHaveBeenCalled()
  })

  it("reports a failed receipt as an error, not a success", async () => {
    const cb = callbacks()

    // The sdk hands over the outcome before it checks the receipts
    const result = await reportNearSend(
      send((observer) => {
        observer.onTransactionSend("tx1")
        observer.onStatus?.(outcome)
        observer.onError(new Error("tx1 failed: refund"))
      }),
      cb,
    )

    expect(result).toBe(outcome)
    expect(cb.onError).toHaveBeenCalledWith("tx1 failed: refund")
    expect(cb.onFinalized).toHaveBeenCalledWith(outcome)
    expect(cb.onSuccess).not.toHaveBeenCalled()
  })

  it("reports and throws a rejection the wallet gives as a string", async () => {
    const cb = callbacks()

    await expect(
      reportNearSend(
        send((observer) => observer.onError("User rejected")),
        cb,
      ),
    ).rejects.toThrow("User rejected")

    expect(cb.onError).toHaveBeenCalledWith("User rejected")
    expect(cb.onSubmitted).not.toHaveBeenCalled()
    expect(cb.onSuccess).not.toHaveBeenCalled()
    expect(cb.onFinalized).not.toHaveBeenCalled()
  })

  it("fails a wallet that hands back no outcome instead of waiting", async () => {
    const cb = callbacks()

    await expect(
      reportNearSend(
        send(() => {}),
        cb,
      ),
    ).rejects.toThrow("The wallet returned no transaction outcome")

    expect(cb.onError).toHaveBeenCalledWith(
      "The wallet returned no transaction outcome",
    )
    expect(cb.onSuccess).not.toHaveBeenCalled()
  })
})

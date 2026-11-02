import {
  prepareNoirPayment,
  readNoirBalance,
  reportZecSend,
  toZatoshi,
  ZecTxCallbacks,
} from "@galacticcouncil/web3-connect/src/utils/zec"
import type { ZecCall, ZecTxObserver } from "@galacticcouncil/xc-sdk"
import type {
  Balance,
  NoirWalletProvider,
  SendTransactionParams,
  ZcashAPI,
  ZcashBalanceResult,
  ZcashConnectResult,
} from "@noir-wallet/sdk"
import { afterEach, describe, expect, it, vi } from "vitest"

// The extension never is in node: a case installs the Noir it reads, if any
const noir = vi.hoisted(() => ({ wallet: null as NoirWalletProvider | null }))
vi.mock("@noir-wallet/sdk", () => ({ getNoirWallet: () => noir.wallet }))

afterEach(() => {
  noir.wallet = null
})

const MAIN = "t1NyxCchMSJD5bUhKhKFzFnFnqEtvLbxMEG"
const SAVINGS = "t1aZvxRLCGVeMPFXvqfnBgHVEbi4c6g8MVa"
const DEPOSIT = "t1X5xYTgZRQtAnjwYBebHtrjSWBcfEmyLzx"
const FEE = 20_000n

const account = (id: string, label: string, transparent: string) => ({
  id,
  label,
  walletId: id,
  accountId: "0",
  addresses: { transparent, shielded: `u1${id}` },
})

// Both accounts authorized, `active` being the one Noir pays from
const connected = (active: string): ZcashConnectResult => ({
  transparent: active,
  shielded: "u1",
  accounts: [account("w1", "Main", MAIN), account("w2", "Savings", SAVINGS)],
})

const funds = (fields: Partial<Balance>, synced = true): ZcashBalanceResult => {
  const balance = { transparent: "0", shielded: "0", ...fields }
  return {
    ...balance,
    accounts: [{ id: "w1", walletId: "w1", accountId: "0", balance, synced }],
  }
}

const mockZcash = ({
  accounts = connected(MAIN),
  balance = funds({}),
}: {
  accounts?: ZcashConnectResult | null
  balance?: ZcashBalanceResult
} = {}) => ({
  getAccounts: vi.fn(async () => accounts),
  getBalance: vi.fn(async (_accountId?: string) => balance),
  sendTransaction: vi.fn(async (_params: SendTransactionParams) => "tx1"),
})

type MockZcash = ReturnType<typeof mockZcash>

const installNoir = (zcash: MockZcash) => {
  noir.wallet = {
    isNoirWallet: true,
    zcash: zcash as unknown as ZcashAPI,
  }
}

// Pays 0.001 ZEC from Main through the prepared wallet, as the sdk signer does
const pay = async (zcash: MockZcash) => {
  const call = { from: MAIN, to: DEPOSIT, amount: 100_000n } as ZecCall
  const wallet = await prepareNoirPayment(zcash, call, FEE)
  await wallet.sendTransaction({ to: DEPOSIT, amount: "0.001" })
  return zcash.sendTransaction.mock.calls[0]?.[0]
}

const callbacks = () =>
  ({
    onSubmitted: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onFinalized: vi.fn(),
  }) satisfies ZecTxCallbacks

// Drives the observer the way the sdk signer does
const send =
  (run: (observer: ZecTxObserver) => void) => async (observer: ZecTxObserver) =>
    run(observer)

describe("reportZecSend", () => {
  it("reports a broadcast payment as a success", async () => {
    const cb = callbacks()

    const result = await reportZecSend(
      send((observer) => observer.onTransactionSend("tx1")),
      cb,
    )

    expect(result).toEqual({ txId: "tx1" })
    expect(cb.onSubmitted).toHaveBeenCalledWith("tx1")
    expect(cb.onSuccess).toHaveBeenCalledWith({ txId: "tx1" })
    expect(cb.onFinalized).toHaveBeenCalledWith({ txId: "tx1" })
    expect(cb.onError).not.toHaveBeenCalled()
  })

  it("reports and throws a rejection the wallet gives as an object", async () => {
    const cb = callbacks()

    await expect(
      reportZecSend(
        send((observer) =>
          observer.onError({ code: 4001, message: "User rejected" }),
        ),
        cb,
      ),
    ).rejects.toThrow("User rejected")

    expect(cb.onError).toHaveBeenCalledWith("User rejected")
    expect(cb.onSubmitted).not.toHaveBeenCalled()
    expect(cb.onSuccess).not.toHaveBeenCalled()
    expect(cb.onFinalized).not.toHaveBeenCalled()
  })

  it("reports and rethrows the very Error Noir rejects with", async () => {
    const cb = callbacks()
    const error = new Error("User rejected the request")

    await expect(
      reportZecSend(
        send((observer) => observer.onError(error)),
        cb,
      ),
    ).rejects.toBe(error)

    expect(cb.onError).toHaveBeenCalledWith("User rejected the request")
    expect(cb.onSuccess).not.toHaveBeenCalled()
  })

  it("fails a wallet that hands back no id instead of waiting", async () => {
    const cb = callbacks()

    await expect(
      reportZecSend(
        send(() => {}),
        cb,
      ),
    ).rejects.toThrow("The wallet returned no transaction id")

    expect(cb.onError).toHaveBeenCalledWith(
      "The wallet returned no transaction id",
    )
    expect(cb.onSuccess).not.toHaveBeenCalled()
  })
})

describe("toZatoshi", () => {
  it.each([
    ["0", 0n],
    ["1", 100_000_000n],
    ["0.001", 100_000n],
    ["1234.56789", 123_456_789_000n],
    ["0.123456789", 12_345_678n],
  ])("reads %s ZEC as %s zatoshi", (zec, zatoshi) => {
    expect(toZatoshi(zec)).toBe(zatoshi)
  })
})

describe("prepareNoirPayment", () => {
  it("pays from shielded ZEC, sending no funding source, when it covers the payment and its fee", async () => {
    const zcash = mockZcash({
      balance: funds({ shielded: "0.0012", transparent: "1" }),
    })

    expect(await pay(zcash)).toStrictEqual({
      to: DEPOSIT,
      amount: "0.001",
    })
  })

  it("falls back to transparent ZEC when shielded falls short of the payment and its fee", async () => {
    const zcash = mockZcash({
      balance: funds({ shielded: "0.00119999", transparent: "1" }),
    })

    expect(await pay(zcash)).toStrictEqual({
      to: DEPOSIT,
      amount: "0.001",
      fundingSource: "transparent",
    })
  })

  it("takes Noir's selectable amount as the shielded one", async () => {
    const zcash = mockZcash({
      balance: funds({ shielded: "1", available: "0.001", transparent: "1" }),
    })

    expect(await pay(zcash)).toMatchObject({
      fundingSource: "transparent",
    })
  })

  it("caps the selectable amount at the shielded balance", async () => {
    const zcash = mockZcash({
      balance: funds({ shielded: "0.001", available: "2", transparent: "1" }),
    })

    expect(await pay(zcash)).toMatchObject({
      fundingSource: "transparent",
    })
  })

  it("asks to unlock Noir when it reads no accounts", async () => {
    const zcash = mockZcash({ accounts: null })

    await expect(pay(zcash)).rejects.toThrow(
      `Unlock Noir and switch it to ${MAIN}, then try again`,
    )
    expect(zcash.getBalance).not.toHaveBeenCalled()
    expect(zcash.sendTransaction).not.toHaveBeenCalled()
  })

  it("names the account to switch to when Noir pays from another", async () => {
    const zcash = mockZcash({ accounts: connected(SAVINGS) })

    await expect(pay(zcash)).rejects.toThrow(
      "Noir pays from its active account: switch it to Main, then try again",
    )
    expect(zcash.getBalance).not.toHaveBeenCalled()
    expect(zcash.sendTransaction).not.toHaveBeenCalled()
  })

  it("reads the balance of the active account it pays from", async () => {
    const zcash = mockZcash({ balance: funds({ shielded: "1" }) })

    await pay(zcash)

    expect(zcash.getBalance).toHaveBeenCalledWith()
    expect(zcash.sendTransaction).toHaveBeenCalledOnce()
  })
})

describe("readNoirBalance", () => {
  it("reads zero without Noir", async () => {
    expect(await readNoirBalance(MAIN)).toBe(0n)
  })

  it.each([
    ["a locked Noir", null, MAIN],
    ["an address Noir does not hold", connected(MAIN), DEPOSIT],
  ])("reads zero for %s", async (_, accounts, address) => {
    const zcash = mockZcash({ accounts })
    installNoir(zcash)

    expect(await readNoirBalance(address)).toBe(0n)
    expect(zcash.getBalance).not.toHaveBeenCalled()
  })

  it("reads the account by its id", async () => {
    const zcash = mockZcash()
    installNoir(zcash)

    await readNoirBalance(SAVINGS)

    expect(zcash.getBalance).toHaveBeenCalledWith("w2")
  })

  it.each([
    ["0.5", "2", 200_000_000n],
    ["3", "2", 300_000_000n],
  ])(
    "reads the larger of %s shielded and %s transparent ZEC",
    async (shielded, transparent, zatoshi) => {
      installNoir(mockZcash({ balance: funds({ shielded, transparent }) }))

      expect(await readNoirBalance(MAIN)).toBe(zatoshi)
    },
  )

  it("reports a balance Noir has not synced yet as is", async () => {
    installNoir(mockZcash({ balance: funds({ shielded: "0.5" }, false) }))

    expect(await readNoirBalance(MAIN)).toBe(50_000_000n)
  })

  it.each([
    [{ code: -32603, message: "Internal error" }, "Internal error"],
    [{ code: -32603 }, "Noir balance unavailable"],
  ])("throws a failed read as an Error", async (rejection, message) => {
    const zcash = mockZcash()
    zcash.getBalance.mockRejectedValue(rejection)
    installNoir(zcash)

    const error = await readNoirBalance(MAIN).catch((err: unknown) => err)

    expect(error).toBeInstanceOf(Error)
    expect(error).toHaveProperty("message", message)
  })

  it("rethrows the very Error Noir rejects with", async () => {
    const zcash = mockZcash()
    const error = new Error("Noir is unavailable")
    zcash.getAccounts.mockRejectedValue(error)
    installNoir(zcash)

    await expect(readNoirBalance(MAIN)).rejects.toBe(error)
  })
})

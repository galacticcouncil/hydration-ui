import { type EIP1193Provider, hexToString } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { EIP1193_USER_REJECTED, getEip1193ErrorCode } from "@/utils/ethereum"

import { EthereumSigner } from "./EthereumSigner"

const fixtures = vi.hoisted(() => {
  const chain = {
    id: 222222,
    name: "Hydration",
    nativeCurrency: { name: "HDX", symbol: "HDX", decimals: 12 },
    rpcUrls: { default: { http: ["https://mainnet.invalid"] } },
  }
  const mainnet = { chain, transport: { url: "https://mainnet.invalid" } }
  return {
    chain,
    mainnet,
    getProvider: vi.fn(() => mainnet),
    switchNetwork: vi.fn(),
  }
})
vi.mock("@galacticcouncil/xc-cfg", () => ({
  chainsMap: new Map([
    [
      "hydration",
      {
        evmClient: { chain: fixtures.chain, getProvider: fixtures.getProvider },
      },
    ],
  ]),
}))
vi.mock("@galacticcouncil/utils", () => ({
  HYDRATION_CHAIN_KEY: "hydration",
  isAnyEvmChain: () => true,
  wsToHttp: (url: string) => url.replace(/^ws/, "http"),
}))
vi.mock("@/utils", () => ({ requestNetworkSwitch: fixtures.switchNetwork }))

beforeEach(() => vi.clearAllMocks())
const setup = () => {
  const request = vi.fn(async () => null)
  const signer = new EthereumSigner(
    "0x0000000000000000000000000000000000000001",
    { request } as unknown as EIP1193Provider,
  )
  const options = {
    chainKey: "hydration",
    onSubmitted: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onFinalized: vi.fn(),
  }
  return { signer, options, request }
}

describe("Ethereum signer selected provider", () => {
  it("reads gas, nonces and receipts from the selected fork instead of the default provider", async () => {
    const { signer, options } = setup()
    await signer.switchChain({
      ...options,
      priorityRpcUrl: "wss://lark.invalid",
    })
    expect(signer.publicClient.transport.url).toBe("https://lark.invalid")
    expect(fixtures.getProvider).not.toHaveBeenCalled()
  })

  it("refreshes the read provider when forks share the same EVM chain ID", async () => {
    const { signer, options } = setup()
    await signer.switchChain({
      ...options,
      priorityRpcUrl: "wss://first.invalid",
    })
    await signer.switchChain({
      ...options,
      priorityRpcUrl: "wss://second.invalid",
    })
    expect(signer.publicClient.transport.url).toBe("https://second.invalid")
  })

  it("returns to the chain default when there is no selected override", async () => {
    const { signer, options } = setup()
    await signer.switchChain({
      ...options,
      priorityRpcUrl: "wss://lark.invalid",
    })
    await signer.switchChain(options)
    expect(signer.publicClient).toBe(fixtures.mainnet)
  })

  it("stops when the user rejects the network selection", async () => {
    const { signer, options, request } = setup()
    fixtures.switchNetwork.mockRejectedValueOnce(new Error("Rejected"))
    await expect(
      signer.switchChain({ ...options, priorityRpcUrl: "wss://lark.invalid" }),
    ).rejects.toThrow("Rejected")
    expect(request).not.toHaveBeenCalled()
  })
})

describe("Ethereum signer personal_sign", () => {
  // Leading and trailing whitespace, blank lines and a non-ASCII character:
  // each must reach the wallet as the same bytes.
  const message =
    "  app.example.org wants you to sign in:\n\nNonce: 0xab\r\nÜ end \n"

  it("signs the message byte-exact with personal_sign from the signer's address", async () => {
    const { signer, request } = setup()
    request.mockResolvedValueOnce("0xsig" as never)
    await expect(signer.signMessage(message)).resolves.toBe("0xsig")
    expect(request).toHaveBeenCalledTimes(1)
    const [{ method, params }] = request.mock.calls[0] as unknown as [
      { method: string; params: [`0x${string}`, string] },
    ]
    expect(method).toBe("personal_sign")
    expect(hexToString(params[0])).toBe(message)
    expect(params[1]).toBe("0x0000000000000000000000000000000000000001")
  })

  it("rethrows the provider's own error so code 4001 survives", async () => {
    const { signer, request } = setup()
    const rejection = { code: 4001, message: "User rejected the request." }
    request.mockRejectedValueOnce(rejection)
    const error = await signer.signMessage(message).catch((e: unknown) => e)
    expect(error).toBe(rejection)
    expect(getEip1193ErrorCode(error)).toBe(EIP1193_USER_REJECTED)
  })

  it("reads no code from an error that carries none", () => {
    expect(getEip1193ErrorCode(new Error("timeout"))).toBeNull()
    expect(getEip1193ErrorCode({ code: "4001" })).toBeNull()
    expect(getEip1193ErrorCode(null)).toBeNull()
  })
})

describe("Ethereum signer prepared transaction (strict send)", () => {
  const FROM = "0x00000000000000000000000000000000000000a1"
  const HASH = `0x${"ab".repeat(32)}` as const
  const prepared = {
    chainId: 222222,
    from: FROM,
    to: "0x00000000000000000000000000000000000000b2",
    data: "0xDeadBeef00",
    value: "0x0",
  }
  const receiptJson = (status: "0x1" | "0x0") => ({
    blockHash: `0x${"11".repeat(32)}`,
    blockNumber: "0x10",
    contractAddress: null,
    cumulativeGasUsed: "0x1",
    effectiveGasPrice: "0x1",
    from: FROM,
    gasUsed: "0x1",
    logs: [],
    logsBloom: `0x${"00".repeat(256)}`,
    status,
    to: prepared.to,
    transactionHash: HASH,
    transactionIndex: "0x0",
    type: "0x2",
  })

  type Handler = (params: unknown) => unknown
  const setupPrepared = (overrides: Record<string, Handler> = {}) => {
    const handlers: Record<string, Handler> = {
      eth_accounts: () => [FROM],
      eth_chainId: () => "0x3640e",
      eth_estimateGas: () => "0x64",
      eth_gasPrice: () => "0x64",
      eth_getTransactionCount: () => "0x7",
      eth_sendTransaction: () => HASH,
      eth_blockNumber: () => "0x20",
      eth_getTransactionReceipt: () => receiptJson("0x1"),
      eth_getBlockByNumber: () => ({
        number: "0x20",
        hash: `0x${"22".repeat(32)}`,
        timestamp: "0x1",
        transactions: [],
      }),
      ...overrides,
    }
    const calls: { method: string; params: unknown }[] = []
    const request = vi.fn(
      async ({ method, params }: { method: string; params?: unknown }) => {
        calls.push({ method, params })
        const handler = handlers[method]
        if (!handler) throw new Error(`unexpected ${method}`)
        return handler(params)
      },
    )
    const signer = new EthereumSigner(FROM, {
      request,
    } as unknown as EIP1193Provider)
    const order: string[] = []
    const options = {
      onPrompt: vi.fn(() => order.push("prompt")),
      onReceipt: vi.fn((s: string) => order.push(`receipt:${s}`)),
      onSubmitted: vi.fn(() => order.push("submitted")),
      onSuccess: vi.fn(() => order.push("success")),
      onError: vi.fn((m: string) => order.push(`error:${m}`)),
      onFinalized: vi.fn(),
      onRepriced: vi.fn((h: string) => order.push(`repriced:${h}`)),
      onMined: vi.fn((h: string, st: string) => order.push(`mined:${h}:${st}`)),
    }
    const sends = () =>
      calls.filter((c) => c.method.endsWith("sendTransaction"))
    return { signer, options, calls, sends, order }
  }

  it("sends ONE eth_sendTransaction with to, data, value and chainId exactly as given", async () => {
    const { signer, options, sends, calls, order } = setupPrepared()
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome).toEqual({ kind: "sent", hash: HASH, receipt: "success" })
    expect(sends()).toHaveLength(1)
    const [tx] = sends()[0]!.params as [Record<string, string>]
    expect(sends()[0]!.method).toBe("eth_sendTransaction")
    expect(tx.from).toBe(prepared.from)
    expect(tx.to).toBe(prepared.to)
    expect(tx.data).toBe(prepared.data)
    expect(tx.value).toBe(prepared.value)
    expect(tx.chainId).toBe("0x3640e")
    expect(tx.nonce).toBe("0x7")
    expect(order.slice(0, 4)).toEqual([
      "prompt",
      "submitted",
      "receipt:success",
      "success",
    ])
    // no chain switch, no permit signature
    expect(calls.map((c) => c.method)).not.toContain(
      "wallet_switchEthereumChain",
    )
    expect(calls.map((c) => c.method)).not.toContain("wallet_addEthereumChain")
    expect(calls.map((c) => c.method)).not.toContain("eth_signTypedData_v4")
  })

  it("reads 4001 from the provider's own error: rejected, sent once", async () => {
    const { signer, options, sends } = setupPrepared({
      eth_sendTransaction: () => {
        throw { code: 4001, message: "User rejected the request." }
      },
    })
    await expect(
      signer.sendPreparedTransaction(prepared, options),
    ).resolves.toEqual({ kind: "rejected" })
    expect(sends()).toHaveLength(1)
    expect(options.onSubmitted).not.toHaveBeenCalled()
  })

  it("any other wallet error is failed, never rejected, and is never sent again", async () => {
    for (const thrown of [
      { code: -32602, message: "invalid params" },
      { code: -32603, message: "internal" },
      { code: "4001", message: "User rejected the request." },
      new Error("User rejected the request."),
    ]) {
      const { signer, options, sends } = setupPrepared({
        eth_sendTransaction: () => {
          throw thrown
        },
      })
      const outcome = await signer.sendPreparedTransaction(prepared, options)
      expect(outcome.kind).toBe("failed")
      expect(sends()).toHaveLength(1)
    }
  })

  it("an answer that is not a hash is failed", async () => {
    const { signer, options } = setupPrepared({
      eth_sendTransaction: () => "0x1234",
    })
    await expect(
      signer.sendPreparedTransaction(prepared, options),
    ).resolves.toEqual({ kind: "failed", code: null })
    expect(options.onSubmitted).not.toHaveBeenCalled()
  })

  it("refuses before the prompt when the wallet's active account is not `from`", async () => {
    const { signer, options, sends } = setupPrepared({
      eth_accounts: () => ["0x00000000000000000000000000000000000000c3"],
    })
    await expect(
      signer.sendPreparedTransaction(prepared, options),
    ).resolves.toEqual({ kind: "refused", reason: "account" })
    expect(sends()).toHaveLength(0)
    expect(options.onPrompt).not.toHaveBeenCalled()
  })

  it("refuses before the prompt when the signer's own address is not `from`", async () => {
    const { signer, options, sends } = setupPrepared()
    const other = {
      ...prepared,
      from: "0x00000000000000000000000000000000000000c3",
    }
    await expect(
      signer.sendPreparedTransaction(other, options),
    ).resolves.toEqual({ kind: "refused", reason: "account" })
    expect(sends()).toHaveLength(0)
  })

  it("refuses a chainId mismatch before the prompt and switches nothing", async () => {
    const { signer, options, sends, calls } = setupPrepared({
      eth_chainId: () => "0x1",
    })
    await expect(
      signer.sendPreparedTransaction(prepared, options),
    ).resolves.toEqual({ kind: "refused", reason: "chain" })
    expect(sends()).toHaveLength(0)
    expect(calls.map((c) => c.method)).not.toContain(
      "wallet_switchEthereumChain",
    )
  })

  it("a gas estimate that throws refuses before the prompt", async () => {
    const { signer, options, sends } = setupPrepared({
      eth_estimateGas: () => {
        throw { code: -32000, message: "execution reverted" }
      },
    })
    await expect(
      signer.sendPreparedTransaction(prepared, options),
    ).resolves.toEqual({ kind: "refused", reason: "estimate" })
    expect(sends()).toHaveLength(0)
    expect(options.onPrompt).not.toHaveBeenCalled()
  })

  it("a reverted receipt is reported before the error, after the hash", async () => {
    const { signer, options, order } = setupPrepared({
      eth_getTransactionReceipt: () => receiptJson("0x0"),
    })
    await expect(
      signer.sendPreparedTransaction(prepared, options),
    ).resolves.toEqual({ kind: "sent", hash: HASH, receipt: "reverted" })
    expect(order.slice(0, 3)).toEqual([
      "prompt",
      "submitted",
      "receipt:reverted",
    ])
    expect(options.onSuccess).not.toHaveBeenCalled()
  })

  it("a receipt wait that throws is unknown", async () => {
    const { signer, options } = setupPrepared({
      // a non-retried RPC error after the transaction itself was found
      eth_getTransactionByHash: () => ({
        hash: HASH,
        blockHash: null,
        blockNumber: null,
        from: FROM,
        to: prepared.to,
        nonce: "0x7",
        input: prepared.data,
        value: "0x0",
        gas: "0x64",
        type: "0x2",
        maxFeePerGas: "0x64",
        maxPriorityFeePerGas: "0x64",
        transactionIndex: null,
        chainId: "0x3640e",
        v: "0x0",
        r: "0x1",
        s: "0x1",
      }),
      eth_getTransactionReceipt: () => {
        throw { code: -32000, message: "rpc down" }
      },
    })
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome).toEqual({ kind: "sent", hash: HASH, receipt: "unknown" })
    expect(options.onReceipt).toHaveBeenCalledWith("unknown")
    expect(options.onSuccess).not.toHaveBeenCalled()
    expect(options.onMined).not.toHaveBeenCalled()
  })

  it("onError text never carries the provider's message", async () => {
    const { signer, options } = setupPrepared({
      eth_sendTransaction: () => {
        throw { code: -32000, message: `bad request data ${prepared.data}` }
      },
    })
    await signer.sendPreparedTransaction(prepared, options)
    for (const [message] of options.onError.mock.calls)
      expect(String(message)).not.toContain(prepared.data)
  })

  // ---- fix round 1 (review 3: B-1 R8, B-3, S10, S11) ----

  it("onPrompt fires while eth_sendTransaction is still pending, and a late error is never a refusal", async () => {
    let answer: ((v: unknown) => void) | null = null
    let fail: ((e: unknown) => void) | null = null
    const { signer, options, sends } = setupPrepared({
      eth_sendTransaction: () =>
        new Promise((resolve, reject) => {
          answer = resolve
          fail = reject
        }),
    })
    const pending = signer.sendPreparedTransaction(prepared, options)
    await vi.waitFor(() => expect(sends()).toHaveLength(1))
    expect(options.onPrompt).toHaveBeenCalledTimes(1)
    expect(answer).not.toBeNull()
    fail!({ code: -32603, message: "internal" })
    const outcome = await pending
    expect(outcome.kind).toBe("failed")
    expect(outcome.kind).not.toBe("refused")
  })

  it("a 4001 whose error carries a tx hash is not a decline: failed; the hash goes out only once its receipt is mined", async () => {
    const { signer, options, sends } = setupPrepared({
      eth_sendTransaction: () => {
        throw { code: 4001, message: "User rejected", data: { txHash: HASH } }
      },
    })
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome).toEqual({ kind: "failed", code: 4001, hash: HASH })
    expect(options.onSubmitted).not.toHaveBeenCalled()
    await vi.waitFor(() =>
      expect(options.onMined).toHaveBeenCalledWith(HASH, "success"),
    )
    expect(sends()).toHaveLength(1)
  })

  it("D1-B1: a real Error whose non-enumerable cause holds the hash is not a decline", async () => {
    const thrown = Object.assign(
      new Error("x", { cause: { reason: { transactionHash: HASH } } }),
      { code: 4001 },
    )
    expect(Object.keys(thrown)).not.toContain("cause")
    const { signer, options } = setupPrepared({
      eth_sendTransaction: () => {
        throw thrown
      },
    })
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome.kind).toBe("failed")
  })

  it("D1-B1: a hash at depth 3 (data.originalError.data.hash) is not a decline", async () => {
    const { signer, options } = setupPrepared({
      eth_sendTransaction: () => {
        throw {
          code: 4001,
          message: "x",
          data: { originalError: { data: { hash: HASH } } },
        }
      },
    })
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome.kind).toBe("failed")
  })

  it("a blockHash in a 4001 refuses the decline but is never watched or reported", async () => {
    const BLOCK = `0x${"77".repeat(32)}`
    for (const key of ["blockHash", "parentHash", "requestHash"]) {
      const { signer, options, calls } = setupPrepared({
        eth_sendTransaction: () => {
          throw { code: 4001, message: "x", data: { [key]: BLOCK } }
        },
      })
      const outcome = await signer.sendPreparedTransaction(prepared, options)
      expect(outcome).toEqual({ kind: "failed", code: 4001 })
      await new Promise((r) => setTimeout(r, 20))
      expect(options.onMined).not.toHaveBeenCalled()
      expect(
        calls.filter((c) => c.method === "eth_getTransactionReceipt"),
      ).toHaveLength(0)
    }
  })

  it("a normal send hands its hash out as mined exactly once, after the receipt", async () => {
    const { signer, options, order } = setupPrepared()
    await signer.sendPreparedTransaction(prepared, options)
    expect(options.onMined).toHaveBeenCalledTimes(1)
    expect(order.indexOf(`mined:${HASH}:success`)).toBeGreaterThan(
      order.indexOf("receipt:success"),
    )
  })

  it("a 4001 with a hash-shaped value anywhere (message, cause) is not a decline; an unkeyed value is not reported", async () => {
    for (const thrown of [
      { code: 4001, message: `rejected after ${HASH}` },
      { code: 4001, message: "x", cause: { detail: HASH } },
    ]) {
      const { signer, options } = setupPrepared({
        eth_sendTransaction: () => {
          throw thrown
        },
      })
      const outcome = await signer.sendPreparedTransaction(prepared, options)
      expect(outcome).toEqual({ kind: "failed", code: 4001 })
      expect(options.onSubmitted).not.toHaveBeenCalled()
    }
  })

  const H2 = `0x${"cd".repeat(32)}` as const
  const rpcTx = (
    hash: string,
    to: string,
    input: string,
    blockNumber: string | null,
  ) => ({
    hash,
    nonce: "0x7",
    blockHash: blockNumber ? `0x${"33".repeat(32)}` : null,
    blockNumber,
    transactionIndex: blockNumber ? "0x0" : null,
    from: FROM,
    to,
    value: "0x0",
    gas: "0x5208",
    maxFeePerGas: "0x1",
    maxPriorityFeePerGas: "0x1",
    input,
    type: "0x2",
    chainId: "0x3640e",
    v: "0x0",
    r: `0x${"01".repeat(32)}`,
    s: `0x${"02".repeat(32)}`,
    accessList: [],
    yParity: "0x0",
  })
  /** The wallet replaced the sent tx by H2 (the reviewer's S10 stub RPC). */
  const replacedBy = (to: string, input: string) => {
    let bn = 0x20
    return setupPrepared({
      eth_getTransactionReceipt: (params) => {
        const [h] = params as [string]
        return h === H2
          ? { ...receiptJson("0x1"), transactionHash: H2, to }
          : null
      },
      eth_getTransactionByHash: () =>
        rpcTx(HASH, prepared.to, prepared.data.toLowerCase(), null),
      eth_blockNumber: () => `0x${(bn++).toString(16)}`,
      eth_getBlockByNumber: (params) => {
        const [, full] = params as [string, boolean]
        return {
          number: `0x${bn.toString(16)}`,
          hash: `0x${"44".repeat(32)}`,
          parentHash: `0x${"45".repeat(32)}`,
          timestamp: "0x1",
          nonce: "0x0000000000000000",
          difficulty: "0x0",
          gasLimit: "0x1",
          gasUsed: "0x1",
          miner: FROM,
          extraData: "0x",
          logsBloom: `0x${"00".repeat(256)}`,
          sha3Uncles: `0x${"00".repeat(32)}`,
          stateRoot: `0x${"00".repeat(32)}`,
          receiptsRoot: `0x${"00".repeat(32)}`,
          transactionsRoot: `0x${"00".repeat(32)}`,
          size: "0x1",
          totalDifficulty: "0x0",
          uncles: [],
          baseFeePerGas: "0x1",
          mixHash: `0x${"00".repeat(32)}`,
          transactions: full
            ? [rpcTx(H2, to, input, `0x${bn.toString(16)}`)]
            : [],
        }
      },
    })
  }

  it("a cancel in the wallet (S10) reads unknown: no success, nothing followed", async () => {
    const { signer, options } = replacedBy(FROM, "0x")
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome).toEqual({ kind: "sent", hash: HASH, receipt: "unknown" })
    expect(options.onReceipt).toHaveBeenCalledWith("unknown")
    expect(options.onSuccess).not.toHaveBeenCalled()
    expect(options.onRepriced).not.toHaveBeenCalled()
    expect(options.onMined).not.toHaveBeenCalled()
  }, 30_000)

  it("a replacement by another call reads unknown", async () => {
    const { signer, options } = replacedBy(prepared.to, "0x12345678")
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome).toEqual({ kind: "sent", hash: HASH, receipt: "unknown" })
    expect(options.onSuccess).not.toHaveBeenCalled()
  }, 30_000)

  it("a speed-up (same call, new hash) is followed: the new hash goes out, then its receipt", async () => {
    const { signer, options, order } = replacedBy(
      prepared.to,
      prepared.data.toLowerCase(),
    )
    const outcome = await signer.sendPreparedTransaction(prepared, options)
    expect(outcome).toEqual({ kind: "sent", hash: H2, receipt: "success" })
    expect(order.slice(0, 6)).toEqual([
      "prompt",
      "submitted",
      `repriced:${H2}`,
      "receipt:success",
      "success",
      `mined:${H2}:success`,
    ])
    expect(options.onMined).toHaveBeenCalledTimes(1)
  }, 30_000)
})

describe("waitForFinalReceipt (S11): non-strict follows the signer's current client, strict keeps its own", () => {
  const client = (name: string, seen: string[]) => ({
    getTransactionReceipt: async () => {
      seen.push(name)
      return { blockNumber: 5n, status: "success" }
    },
    getBlock: async () => ({ number: name === "B" ? 10n : 1n }),
  })
  type Waiter = {
    publicClient: unknown
    waitForFinalReceipt: (h: string, o: object, c?: unknown) => Promise<unknown>
  }
  it("without a client: reads this.publicClient on every poll (master behaviour)", async () => {
    const { signer } = setup()
    const s = signer as unknown as Waiter
    const seen: string[] = []
    s.publicClient = client("A", seen)
    const p = s.waitForFinalReceipt("0x01", { interval: 5, timeout: 2_000 })
    await new Promise((r) => setTimeout(r, 12))
    s.publicClient = client("B", seen)
    expect(await p).not.toBeNull()
    expect(seen).toContain("B")
  })
  it("with a client: keeps it", async () => {
    const { signer } = setup()
    const s = signer as unknown as Waiter
    const seen: string[] = []
    const pinned = client("A", seen)
    s.publicClient = pinned
    const p = s.waitForFinalReceipt(
      "0x01",
      { interval: 5, timeout: 60 },
      pinned,
    )
    await new Promise((r) => setTimeout(r, 12))
    s.publicClient = client("B", seen)
    expect(await p).toBeNull()
    expect(seen).not.toContain("B")
  })
})

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
})

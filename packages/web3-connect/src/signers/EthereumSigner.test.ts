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

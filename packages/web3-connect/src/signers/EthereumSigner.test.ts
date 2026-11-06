import { type EIP1193Provider } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

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

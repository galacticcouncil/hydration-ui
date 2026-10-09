import { type EIP1193Provider } from "viem"
import { describe, expect, it, vi } from "vitest"

import { requestNetworkSwitch } from "./ethereum"

vi.mock("@galacticcouncil/utils", () => ({
  HYDRATION_CHAIN_KEY: "hydration",
  isAnyEvmChain: () => true,
  wsToHttp: (url: string) => url.replace(/^ws/, "http"),
}))
vi.mock("@galacticcouncil/xc-cfg", () => ({
  chainsMap: new Map([
    [
      "hydration",
      {
        evmClient: {
          chain: {
            id: 222222,
            name: "Hydration",
            nativeCurrency: { name: "HDX", symbol: "HDX", decimals: 12 },
            rpcUrls: { default: { http: ["https://mainnet.invalid"] } },
          },
        },
      },
    ],
  ]),
}))

describe("Selected wallet RPC", () => {
  it("does not offer mainnet fallbacks for a selected testnet fork", async () => {
    const request = vi.fn(async () => null)
    await requestNetworkSwitch({ request } as unknown as EIP1193Provider, {
      chain: "hydration",
      priorityRpcUrl: "wss://lark.invalid",
    })
    expect(request).toHaveBeenCalledWith({
      method: "wallet_addEthereumChain",
      params: [expect.objectContaining({ rpcUrls: ["https://lark.invalid"] })],
    })
  })

  it("retains the normal chain defaults without an override", async () => {
    const request = vi.fn(async () => null)
    await requestNetworkSwitch({ request } as unknown as EIP1193Provider, {
      chain: "hydration",
    })
    expect(request).toHaveBeenCalledWith({
      method: "wallet_addEthereumChain",
      params: [
        expect.objectContaining({ rpcUrls: ["https://mainnet.invalid"] }),
      ],
    })
  })
})

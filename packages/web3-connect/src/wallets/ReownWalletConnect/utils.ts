import { EvmParachain, Parachain } from "@galacticcouncil/xc-core"
import { AppKit } from "@reown/appkit"
import { AppKitNetwork } from "@reown/appkit/networks"
import type UniversalProvider from "@walletconnect/universal-provider"
import {
  getPolkadotSignerFromPjs,
  PolkadotSigner,
} from "polkadot-api/pjs-signer"
import { isString } from "remeda"

export type Caip10Account = {
  namespace: string
  chainId: string
  address: string
}

export const defineSubstrateNetwork = (
  chain: Parachain | EvmParachain,
): AppKitNetwork => {
  const id = chain.genesisHash.slice(2, 34)

  return {
    id,
    name: chain.name,
    nativeCurrency: {} as AppKitNetwork["nativeCurrency"],
    rpcUrls: {
      default: {
        http: [],
        webSocket: isString(chain.ws) ? [chain.ws] : (chain.ws ?? []),
      },
    },
    chainNamespace: "polkadot",
    caipNetworkId: `polkadot:${id}`,
  }
}

export const getAppKitPolkadotSigner = (
  appKit: AppKit,
  address: string,
): PolkadotSigner => {
  const provider = appKit.getProvider<UniversalProvider>("polkadot")
  if (!provider) throw new Error("No provider found")
  if (!provider.session) throw new Error("No session found")

  return getPolkadotSignerFromPjs(
    address,
    (transactionPayload) => {
      if (!provider.session) throw new Error("No session found")

      return provider.client.request({
        topic: provider.session.topic,
        chainId: `polkadot:${transactionPayload.genesisHash.substring(2, 34)}`,
        request: {
          method: "polkadot_signTransaction",
          params: {
            address,
            transactionPayload,
          },
        },
      })
    },
    async ({ address, data }) => {
      if (!provider.session) throw new Error("No session found")
      const networks = appKit.getCaipNetworks("polkadot")
      const chainId = networks[0]?.caipNetworkId
      if (!chainId) throw new Error("No chainId found")

      return provider.client.request({
        topic: provider.session.topic,
        chainId,
        request: {
          method: "polkadot_signMessage",
          params: {
            address,
            message: data,
          },
        },
      })
    },
  )
}

export const SESSION_NAMESPACES = ["polkadot", "eip155"] as const

export type SessionNamespace = (typeof SESSION_NAMESPACES)[number]

export const hasSessionNamespace = (provider: UniversalProvider): boolean =>
  SESSION_NAMESPACES.some((ns) => provider.session?.namespaces?.[ns])

export const parseCaip10Account = (caip: string): Caip10Account | null => {
  const parts = caip.split(":")
  if (parts.length < 3) return null
  const [namespace, chainId, ...addressParts] = parts
  return {
    namespace,
    chainId,
    address: addressParts.join(":"),
  }
}

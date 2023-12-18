import { Buffer } from "buffer"
import { Maybe } from "utils/helpers"
import type { ExternalProvider } from "@ethersproject/providers"
import type EventEmitter from "events"
import { evmChains } from "@galacticcouncil/xcm-cfg"

export interface MetaMaskProvider extends ExternalProvider, EventEmitter {}

export interface AddEvmChainParams {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

const EXPLORER_URLS: Record<string, string[]> = {
  hydradx: [import.meta.env.VITE_EVM_EXPLORER_URL as string],
}

const getAddEvmChainParams = (chain: string): AddEvmChainParams => {
  const chainProps = evmChains[chain]

  return {
    chainId: "0x" + Number(chainProps.id).toString(16),
    chainName: chainProps.name,
    rpcUrls: chainProps.rpcUrls.default.http as string[],
    blockExplorerUrls: EXPLORER_URLS[chain] ?? [],
    nativeCurrency: chainProps.nativeCurrency,
  }
}

export function isMetaMask(
  provider: Maybe<ExternalProvider>,
): provider is Required<MetaMaskProvider> {
  return !!provider && !!provider?.isMetaMask
}

type RequestNetworkSwitchOptions = {
  onSwitch?: () => void
  chain?: keyof typeof evmChains
}
export async function requestNetworkSwitch(
  provider: Maybe<MetaMaskProvider>,
  options: RequestNetworkSwitchOptions = {},
) {
  if (!isMetaMask(provider)) return

  const params = getAddEvmChainParams(options.chain ?? "hydradx")

  try {
    await provider
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: params.chainId }],
      })
      .then(options?.onSwitch)
  } catch (error: any) {
    // missing or unsupported network error
    if (error?.code === 4902) {
      try {
        await provider
          .request({
            method: "wallet_addEthereumChain",
            params: [params],
          })
          .then(options?.onSwitch)
      } catch (err) {}
    }
  }
}

export type WatchAssetParams = {
  symbol: string
  decimals: number
  image?: string
}

export async function watchAsset(
  provider: Maybe<MetaMaskProvider>,
  assetId: number | string,
  params: WatchAssetParams,
) {
  if (!isMetaMask(provider)) return

  const tokenAddress = Buffer.from(
    "0000000000000000000000000000000100000000",
    "hex",
  )
  const assetIdBuffer = numToBuffer(+assetId)
  assetIdBuffer.copy(tokenAddress, 16)

  const address = "0x" + tokenAddress.toString("hex")

  return await requestNetworkSwitch(provider, {
    onSwitch: async () =>
      await provider?.request({
        method: "wallet_watchAsset",
        params: {
          // @ts-ignore - generic ExternalProvider doesn't know this type, but it works in MetaMask
          type: "ERC20",
          options: {
            address,
            ...params,
          },
        },
      }),
  })
}

export const requestAccounts = async (provider: Maybe<MetaMaskProvider>) => {
  if (!isMetaMask(provider)) return
  await provider.request({
    method: "wallet_requestPermissions",
    params: [
      {
        eth_accounts: {},
      },
    ],
  })
}

function numToBuffer(num: number) {
  const arr = new Uint8Array(4)
  for (let i = 0; i < 4; i++) arr.set([num / 0x100 ** i], 3 - i)
  return Buffer.from(arr)
}

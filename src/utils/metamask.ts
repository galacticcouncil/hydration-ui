import { Buffer } from "buffer"
import { Maybe } from "utils/helpers"
import type { ExternalProvider } from "@ethersproject/providers"
import type EventEmitter from "events"
import { evmChains } from "@galacticcouncil/xcm-sdk"

const METAMASK_LIKE_CHECKS = ["isTalisman"] as const
type MetaMaskLikeChecksValues = (typeof METAMASK_LIKE_CHECKS)[number]

type MetaMaskLikeChecks = {
  [key in MetaMaskLikeChecksValues]: boolean
}

export interface MetaMaskLikeProvider
  extends ExternalProvider,
    EventEmitter,
    MetaMaskLikeChecks {}

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

const getAddEvmChainParams = (chain: string): AddEvmChainParams => {
  const chainProps = evmChains[chain]

  return {
    chainId: "0x" + Number(chainProps.id).toString(16),
    chainName: chainProps.name,
    rpcUrls: chainProps.rpcUrls.default.http as string[],
    nativeCurrency: chainProps.nativeCurrency,
    blockExplorerUrls: chainProps.blockExplorers?.default
      ? [chainProps.blockExplorers.default.url]
      : [],
  }
}

export function isMetaMask(
  provider: Maybe<ExternalProvider>,
): provider is Required<MetaMaskLikeProvider> {
  return !!provider && !!provider?.isMetaMask
}

export function isMetaMaskLike(
  provider: Maybe<ExternalProvider>,
): provider is Required<MetaMaskLikeProvider> {
  return (
    isMetaMask(provider) &&
    METAMASK_LIKE_CHECKS.some((key) => !!provider?.[key])
  )
}

export function isTalisman(
  provider: Maybe<ExternalProvider>,
): provider is Required<MetaMaskLikeProvider> {
  return isMetaMaskLike(provider) && !!provider?.isTalisman
}

type RequestNetworkSwitchOptions = {
  onSwitch?: () => void
  chain?: keyof typeof evmChains
}
export async function requestNetworkSwitch(
  provider: Maybe<MetaMaskLikeProvider>,
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
  provider: Maybe<MetaMaskLikeProvider>,
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

export const requestAccounts = async (
  provider: Maybe<MetaMaskLikeProvider>,
) => {
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

import { Buffer } from "buffer"
import { POLKADOT_APP_NAME } from "utils/api"
import { NATIVE_EVM_ASSET_DECIMALS, NATIVE_EVM_ASSET_SYMBOL } from "utils/evm"
import { Maybe, noop } from "utils/helpers"
import type { ExternalProvider } from "@ethersproject/providers"
import type EventEmitter from "events"

const chainId = import.meta.env.VITE_EVM_CHAIN_ID as string
const rpcUrl = import.meta.env.VITE_EVM_PROVIDER_URL as string
const explorerUrl = import.meta.env.VITE_EVM_EXPLORER_URL as string

export interface MetaMaskProvider extends ExternalProvider, EventEmitter {}

export interface AddEvmChainParams {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: 18
  }
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

const EVM_CHAIN_PARAMS: AddEvmChainParams = {
  chainId: "0x" + Number(chainId).toString(16),
  chainName: POLKADOT_APP_NAME,
  rpcUrls: [rpcUrl],
  blockExplorerUrls: [explorerUrl],
  nativeCurrency: {
    decimals: NATIVE_EVM_ASSET_DECIMALS,
    name: NATIVE_EVM_ASSET_SYMBOL,
    symbol: NATIVE_EVM_ASSET_SYMBOL,
  },
}

export function isMetaMask(
  provider: Maybe<ExternalProvider>,
): provider is Required<MetaMaskProvider> {
  return !!provider && !!provider?.isMetaMask
}

export async function requestNetworkSwitch(
  provider: Maybe<MetaMaskProvider>,
  onSwitch: () => unknown = noop,
) {
  if (!isMetaMask(provider)) return
  try {
    await provider
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x" + Number(chainId).toString(16) }],
      })
      .then(onSwitch)
  } catch (error: any) {
    // missing or unsupported network error
    if (error?.code === 4902) {
      try {
        await provider
          .request({
            method: "wallet_addEthereumChain",
            params: [EVM_CHAIN_PARAMS],
          })
          .then(onSwitch)
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
  console.log({ provider })
  if (!isMetaMask(provider)) return

  const tokenAddress = Buffer.from(
    "0000000000000000000000000000000100000000",
    "hex",
  )
  const assetIdBuffer = numToBuffer(+assetId)
  assetIdBuffer.copy(tokenAddress, 16)

  const address = "0x" + tokenAddress.toString("hex")

  return await requestNetworkSwitch(
    provider,
    async () =>
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
  )
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

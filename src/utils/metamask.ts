import { SDKProvider } from "@metamask/sdk"
import { Buffer } from "buffer"
import { POLKADOT_APP_NAME } from "utils/api"
import { NATIVE_EVM_ASSET_DECIMALS, NATIVE_EVM_ASSET_SYMBOL } from "utils/evm"

const chainId = import.meta.env.VITE_EVM_CHAIN_ID as string
const rpcUrl = import.meta.env.VITE_EVM_PROVIDER_URL as string
const explorerUrl = import.meta.env.VITE_EVM_EXPLORER_URL as string

export const isMetaMaskInstalled =
  !!window.ethereum && !!window.ethereum?.isMetaMask

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

export async function requestNetworkSwitch(provider: SDKProvider) {
  if (!provider) return
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + Number(chainId).toString(16) }],
    })
  } catch (error: any) {
    // missing or unsupported network error
    if (error?.code === 4902) {
      try {
        await provider.request({
          method: "wallet_addEthereumChain",
          params: [EVM_CHAIN_PARAMS],
        })
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
  assetId: number | string,
  params: WatchAssetParams,
) {
  if (!isMetaMaskInstalled) return
  const tokenAddress = Buffer.from(
    "0000000000000000000000000000000100000000",
    "hex",
  )
  const assetIdBuffer = numToBuffer(+assetId)
  assetIdBuffer.copy(tokenAddress, 16)

  const address = "0x" + tokenAddress.toString("hex")

  return await window.ethereum?.request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address,
        ...params,
      },
    },
  })
}

function numToBuffer(num: number) {
  const arr = new Uint8Array(4)
  for (let i = 0; i < 4; i++) arr.set([num / 0x100 ** i], 3 - i)
  return Buffer.from(arr)
}

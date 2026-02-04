/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  hasOwn,
  HYDRATION_CHAIN_KEY,
  isAnyEvmChain,
  wsToHttp,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { isFunction } from "remeda"
import { EIP1193Provider } from "viem"

type RequestNetworkSwitchOptions = {
  onSwitch?: () => void
  chain?: string
  priorityRpcUrl?: string
}

export async function requestAccounts(provider: EIP1193Provider) {
  if (!isEip1193Provider(provider)) return
  await provider.request({
    method: "wallet_requestPermissions",
    params: [{ eth_accounts: {} }],
  })
}

export async function requestNetworkSwitch(
  provider: EIP1193Provider,
  options: RequestNetworkSwitchOptions = {},
) {
  if (!isEip1193Provider(provider)) return

  const params = getAddEvmChainParams(
    options.chain ?? HYDRATION_CHAIN_KEY,
    options.priorityRpcUrl,
  )

  try {
    if (options.chain === HYDRATION_CHAIN_KEY) {
      // request to add chain first, wallet will skip this if the chain and rpc combination already exists
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [params],
      })
    }

    await provider
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: params.chainId }],
      })
      .then(options?.onSwitch)
  } catch (error: unknown) {
    /**
     * MetaMask v12.14.2 introduced bug with switching networks.
     * We catch this error and ignore it for now, other than that it seems to work.
     * @see https://github.com/MetaMask/metamask-extension/issues/31464
     */
    if (
      error instanceof Error &&
      typeof error?.message === "string" &&
      error.message.includes("is not a function")
    ) {
      return
    }

    const errorType = normalizeChainSwitchError(provider, error)

    if (errorType === "CHAIN_NOT_FOUND") {
      try {
        await Promise.race([
          provider.request({
            method: "wallet_addEthereumChain",
            params: [params],
          }),
          new Promise((resolve) => {
            const id = setInterval(async () => {
              const chainId = await provider.request({ method: "eth_chainId" })
              if (chainId === params.chainId) {
                resolve(true)
                clearInterval(id)
              } else {
                await provider.request({
                  method: "wallet_switchEthereumChain",
                  params: [params],
                })
              }
            }, 5000)
          }),
        ])

        options?.onSwitch?.()
      } catch {
        console.error("Failed to switch network")
      }
    } else {
      if (error instanceof Error) throw error
    }
  }
}

export type AddEvmChainParams = {
  chainId: string
  chainName: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
  iconUrls: string[]
  rpcUrls: string[]
  blockExplorerUrls?: string[]
}

const getAddEvmChainParams = (
  chainKey: string,
  priorityRpcUrl?: string,
): AddEvmChainParams => {
  const chain = chainsMap.get(chainKey)

  if (!chain || !isAnyEvmChain(chain)) {
    throw new Error("Chain is not an EVM chain")
  }

  const chainProps = chain.evmClient.chain

  const rpcUrls = priorityRpcUrl
    ? Array.from(
        new Set([wsToHttp(priorityRpcUrl), ...chainProps.rpcUrls.default.http]),
      )
    : [...chainProps.rpcUrls.default.http]

  return {
    chainId: "0x" + Number(chainProps.id).toString(16),
    chainName: chainProps.name,
    rpcUrls: rpcUrls,
    iconUrls: [],
    nativeCurrency: chainProps.nativeCurrency,
    blockExplorerUrls: chainProps.blockExplorers?.default
      ? [chainProps.blockExplorers.default.url]
      : [],
  } satisfies AddEvmChainParams
}

function normalizeChainSwitchError(provider: EIP1193Provider, error: any) {
  if (!provider) return
  let message: Record<string, any> = {}

  if (typeof error === "string") {
    return "CHAIN_NOT_FOUND"
  }

  try {
    message =
      typeof error?.message === "string" ? JSON.parse(error.message) : {}
  } catch (err) {
    console.error("Failed to parse error message", err)
  }

  const errorCode =
    message?.data?.originalError?.code ||
    error.data?.originalError?.code ||
    error?.code

  if (errorCode === 4902) {
    return "CHAIN_NOT_FOUND"
  }
}

export function isMetaMask(
  provider: EIP1193Provider | null | undefined,
): provider is Required<EIP1193Provider> {
  if (!isEip1193Provider(provider) || !hasOwn(provider, "isMetaMask")) {
    return false
  }
  const eip1193 = provider as EIP1193Provider & { isMetaMask?: boolean }
  return eip1193.isMetaMask === true
}

export function isEip1193Provider(
  provider: EIP1193Provider | null | undefined,
): provider is Required<EIP1193Provider> {
  return isFunction(provider?.request)
}

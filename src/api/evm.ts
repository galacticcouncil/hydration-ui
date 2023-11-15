import { SDKProvider } from "@metamask/sdk"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { useWallet } from "sections/web3-connect/Web3Connect.utils"
import { MetaMask } from "sections/web3-connect/wallets/MetaMask"
import { BN_0 } from "utils/constants"
import { undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

const getNativeEvmTokenBalance = (provider: SDKProvider, address: string) => {
  return async () => {
    return provider.request<string>({
      method: "eth_getBalance",
      params: [address, "latest"],
    })
  }
}

export const useNativeEvmTokenBalance = (address: string) => {
  const { wallet } = useWallet()

  const provider = wallet instanceof MetaMask ? wallet.extension : null

  const enabled = !!(provider && address)

  return useQuery(
    QUERY_KEYS.nativeEvmTokenBalance(address),
    enabled ? getNativeEvmTokenBalance(provider, address) : undefinedNoop,
    {
      enabled,
      select: (data) =>
        data
          ? {
              balance: BigNumber(data),
            }
          : {
              balance: BN_0,
            },
    },
  )
}

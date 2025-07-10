import { Provider } from "@ethersproject/providers"
import { useCallback } from "react"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { getProvider } from "sections/lending/utils/marketsAndNetworksConfig"

export const useOnNextNetworkUpdate = () => {
  const { currentMarketData } = useProtocolDataContext()
  return useCallback(
    async (callback: () => void) => {
      const provider = getProvider(currentMarketData.chainId)
      await waitForBlock(provider)
      callback()
    },
    [currentMarketData.chainId],
  )
}

export async function waitForBlock(provider: Provider): Promise<void> {
  const currentBlock = await provider.getBlockNumber()
  return new Promise((resolve, reject) => {
    let timeout: NodeJS.Timeout | null = null

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
    }

    const checkBlock = async () => {
      try {
        const newBlock = await provider.getBlockNumber()
        if (!newBlock || newBlock <= currentBlock) {
          cleanup()
          timeout = setTimeout(checkBlock, 5000)
        } else {
          cleanup()
          resolve()
        }
      } catch (error) {
        cleanup()
        reject(error)
      }
    }

    checkBlock()
  })
}

import {
  HexString,
  isEvmChain,
  safeConvertSS58toH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { useEffect } from "react"

import { useApprovalTrackingStore } from "@/modules/xcm/transfer/hooks/useApprovalTrackingStore"

export const useTrackApprovals = (chainKey: string) => {
  const { account } = useAccount()
  const { getPendingApprovals, removePendingApproval } =
    useApprovalTrackingStore()

  useEffect(() => {
    const chain = chainsMap.get(chainKey)
    const h160Addr = account ? safeConvertSS58toH160(account.address) : ""
    const isValidEvmChain = !!chain && isEvmChain(chain)

    if (!h160Addr || !isValidEvmChain) {
      return
    }

    const provider = chain.evmClient.getProvider()
    const unsub = provider.watchBlockNumber({
      onBlockNumber: async (blockNumber) => {
        const nonce = await provider.getTransactionCount({
          address: h160Addr as HexString,
          blockNumber,
        })

        const approvals = getPendingApprovals(chainKey, nonce)

        approvals.forEach((tx) => {
          if (tx.nonce < nonce) {
            removePendingApproval(tx.chainKey, tx.nonce)
          }
        })
      },
    })

    return () => {
      unsub()
    }
  }, [account, chainKey, getPendingApprovals, removePendingApproval])
}

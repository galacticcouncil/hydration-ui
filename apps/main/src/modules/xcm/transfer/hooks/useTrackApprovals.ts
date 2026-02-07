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
  const { pendingApprovals, removePendingApproval } = useApprovalTrackingStore()
  const { account } = useAccount()

  useEffect(() => {
    const chain = chainsMap.get(chainKey)
    const h160Addr = account ? safeConvertSS58toH160(account.address) : ""
    const approvals = pendingApprovals.filter((tx) => tx.chainKey === chainKey)
    const isValidEvmChain = !!chain && isEvmChain(chain)

    if (approvals.length === 0 || !h160Addr || !isValidEvmChain) {
      return
    }

    const provider = chain.evmClient.getProvider()
    const unsub = provider.watchBlockNumber({
      onBlockNumber: async (blockNumber) => {
        const nonce = await provider.getTransactionCount({
          address: h160Addr as HexString,
          blockNumber,
        })

        const approvedTxs = approvals.filter((tx) => tx.nonce < nonce)

        approvedTxs.forEach((tx) => {
          removePendingApproval(tx.chainKey, tx.nonce)
        })
      },
    })

    return () => {
      unsub()
    }
  }, [account, chainKey, pendingApprovals, removePendingApproval])
}

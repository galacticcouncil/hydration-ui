import { HexString, QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { Call } from "@galacticcouncil/xc-sdk"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { isEvmApproveCall } from "@/modules/transactions/utils/xcm"

export const useEvmApprovalFee = (call: Call | null) => {
  const wallet = useWallet()
  return useQuery({
    enabled:
      !!call && isEvmApproveCall(call) && isEthereumSigner(wallet?.signer),
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "evm",
      "approvalFee",
      call?.data,
      call?.from,
    ],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      if (
        !call ||
        !isEvmApproveCall(call) ||
        !isEthereumSigner(wallet?.signer)
      ) {
        return null
      }

      const { gas, gasPrice } = await wallet.signer.estimateGas({
        account: call.from as HexString,
        data: call.data as HexString,
        to: call.to,
        value: call.value,
      })

      return gas * gasPrice
    },
  })
}

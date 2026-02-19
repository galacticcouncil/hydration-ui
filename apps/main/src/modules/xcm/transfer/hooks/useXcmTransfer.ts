import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import {
  useCrossChainWallet,
  xcmTransferCallQuery,
  xcmTransferQuery,
  xcmTransferReportQuery,
} from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { getXcmTransferArgs } from "@/modules/xcm/transfer/utils/transfer"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useXcmTransfer = (form: UseFormReturn<XcmFormValues>) => {
  const rpc = useRpcProvider()
  const wallet = useCrossChainWallet()
  const { account } = useAccount()

  const values = form.watch()

  const transferArgs = getXcmTransferArgs(account, values)

  const { data: transfer, isLoading: isLoadingTransfer } = useQuery(
    xcmTransferQuery(wallet, transferArgs),
  )

  const [reportQuery, callQuery] = useQueries({
    queries: [
      xcmTransferReportQuery(transfer ?? null, transferArgs),
      xcmTransferCallQuery(
        rpc,
        transfer ?? null,
        values.srcAmount,
        transferArgs,
        form.formState.isValid,
      ),
    ],
  })

  const { data: report, isLoading: isLoadingReport } = reportQuery
  const { data: callData, isLoading: isLoadingCall } = callQuery

  return {
    transfer: transfer ?? null,
    isLoadingTransfer,
    report: report ?? null,
    isLoadingReport,
    call: callData?.call ?? null,
    dryRunError: callData?.dryRunError ?? null,
    isLoadingCall,
  }
}

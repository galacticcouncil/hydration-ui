import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import {
  useCrossChainWallet,
  XcmTransferArgs,
  xcmTransferCallQuery,
  xcmTransferQuery,
  xcmTransferReportQuery,
} from "@/api/xcm"
import { ENV } from "@/config/env"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useXcmTransfer = (
  form: UseFormReturn<XcmFormValues>,
  transferArgs: XcmTransferArgs | null,
) => {
  const rpc = useRpcProvider()
  const wallet = useCrossChainWallet()

  const values = form.watch()

  const { data: transfer, isLoading: isLoadingTransfer } = useQuery(
    xcmTransferQuery(wallet, transferArgs),
  )

  const [reportQuery, callQuery] = useQueries({
    queries: [
      xcmTransferReportQuery(
        form.formState.isValid && transfer ? transfer : null,
        transferArgs,
      ),
      xcmTransferCallQuery(
        rpc,
        transfer ?? null,
        values.srcAmount,
        transferArgs,
        form.formState.isValid && ENV.VITE_DRY_RUN_ENABLED,
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

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

  const {
    data: transfer,
    isLoading: isLoadingTransferQuery,
    isFetching: isFetchingTransfer,
    isPlaceholderData: isTransferPlaceholder,
  } = useQuery(xcmTransferQuery(wallet, transferArgs))

  const syncedTransfer = transfer && !isTransferPlaceholder ? transfer : null

  const isLoadingTransfer =
    !!transferArgs &&
    !syncedTransfer &&
    (isLoadingTransferQuery || isFetchingTransfer)

  const [reportQuery, callQuery] = useQueries({
    queries: [
      xcmTransferReportQuery(
        form.formState.isValid && syncedTransfer ? syncedTransfer : null,
        transferArgs,
      ),
      xcmTransferCallQuery(
        rpc,
        syncedTransfer,
        values.srcAmount,
        transferArgs,
        form.formState.isValid && ENV.VITE_DRY_RUN_ENABLED,
      ),
    ],
  })

  const { data: report, isLoading: isLoadingReport } = reportQuery
  const { data: callData, isLoading: isLoadingCall } = callQuery

  return {
    transfer: syncedTransfer,
    isLoadingTransfer,
    report: syncedTransfer ? (report ?? null) : null,
    isLoadingReport: isLoadingTransfer || isLoadingReport,
    call: syncedTransfer ? (callData?.call ?? null) : null,
    dryRunError: syncedTransfer ? (callData?.dryRunError ?? null) : null,
    isLoadingCall,
  }
}

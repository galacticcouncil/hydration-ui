import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import {
  useCrossChainWallet,
  useZcashRoutes,
  XcmTransferArgs,
  xcmTransferCallQuery,
  xcmTransferQuery,
  xcmTransferReportQuery,
} from "@/api/xcm"
import { ENV } from "@/config/env"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { findZcashRoute } from "@/modules/xcm/transfer/utils/zcash"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useXcmTransfer = (
  form: UseFormReturn<XcmFormValues>,
  transferArgs: XcmTransferArgs | null,
) => {
  const rpc = useRpcProvider()
  const wallet = useCrossChainWallet()
  const zcashRoutes = useZcashRoutes()

  const values = form.watch()

  const {
    data: transfer,
    isLoading: isLoadingTransferQuery,
    isFetching: isFetchingTransfer,
    isPlaceholderData: isTransferPlaceholder,
  } = useQuery(xcmTransferQuery(wallet, transferArgs, zcashRoutes))

  const syncedTransfer = transfer && !isTransferPlaceholder ? transfer : null

  // Building a Zcash transfer's call opens a 1Click deposit address or orders
  // an Omni one, so it's built at submit only, never per amount typed
  const isCallDeferred = !!findZcashRoute(zcashRoutes, transferArgs ?? {})

  const isLoadingTransfer =
    !!transferArgs &&
    !syncedTransfer &&
    (isLoadingTransferQuery || isFetchingTransfer)

  const [reportQuery, callQuery] = useQueries({
    queries: [
      xcmTransferReportQuery(
        form.formState.isValid && syncedTransfer ? syncedTransfer : null,
        values.srcAmount,
        transferArgs,
      ),
      xcmTransferCallQuery(
        rpc,
        isCallDeferred ? null : syncedTransfer,
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

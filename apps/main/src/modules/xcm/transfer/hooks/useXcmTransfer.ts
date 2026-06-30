import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import {
  useCrossChainWallet,
  XcmTransferArgs,
  xcmTransferCallQuery,
  xcmTransferQuery,
  xcmTransferReportQuery,
} from "@/api/xcm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

export const useXcmTransfer = (
  form: UseFormReturn<XcmFormValues>,
  transferArgs: XcmTransferArgs | null,
) => {
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
      xcmTransferCallQuery(transfer ?? null, values.srcAmount, transferArgs),
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
    isLoadingCall,
  }
}

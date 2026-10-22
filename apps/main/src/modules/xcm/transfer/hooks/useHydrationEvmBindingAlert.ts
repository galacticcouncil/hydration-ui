import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { evmAccountBindingQuery } from "@/api/evm"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"
import { XcmAlert } from "@/modules/xcm/transfer/hooks/useXcmProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useHydrationEvmBindingAlert = (
  form: UseFormReturn<XcmFormValues>,
  requiresBinding: boolean,
): { alerts: XcmAlert[]; isLoading: boolean } => {
  const { t } = useTranslation(["xcm"])
  const rpc = useRpcProvider()

  const [destAddress, destAsset] = form.watch(["destAddress", "destAsset"])

  const {
    data: isBound,
    isError,
    isLoading,
  } = useQuery(evmAccountBindingQuery(rpc, requiresBinding ? destAddress : ""))

  const alerts = useMemo<XcmAlert[]>(() => {
    if (!requiresBinding) return []
    if (!isError && isBound !== false) return []

    return [
      {
        key: "accountNotBound",
        message: t("xcm:report.account.notBound", {
          symbol: destAsset?.originSymbol,
        }),
        severity: "error" as const,
      },
    ]
  }, [destAsset?.originSymbol, isBound, isError, requiresBinding, t])

  return { alerts, isLoading: requiresBinding && isLoading }
}

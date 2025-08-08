import { ProtocolAction } from "@aave/contract-helpers"
import { useMemo } from "react"

import { createProtocolToastFn, ToastFnParams } from "@/ui-config/toasts"

export const useProtocolActionToasts = (
  action: ProtocolAction,
  params: ToastFnParams,
) => {
  const { state, value } = params
  return useMemo(() => {
    const createToast = createProtocolToastFn(action)
    return createToast({
      state,
      value,
    })
  }, [action, state, value])
}

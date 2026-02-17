import { ProtocolAction } from "@aave/contract-helpers"
import { useMemo } from "react"

import {
  createProtocolToastFn,
  CustomToastAction,
  ToastFnParams,
} from "@/ui-config/toasts"

export const useProtocolActionToasts = (
  action: ProtocolAction | CustomToastAction,
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

import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

export const useResetAmounts = () => {
  const form = useFormContext<XcmFormValues>()
  return useCallback(async () => {
    form.reset((prev) => ({
      ...prev,
      srcAmount: "",
      destAmount: "",
    }))
    await form.trigger()
    form.clearErrors()
  }, [form])
}

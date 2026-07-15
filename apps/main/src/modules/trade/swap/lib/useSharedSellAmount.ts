import { useEffect } from "react"
import { FieldValues, UseFormReturn } from "react-hook-form"

import { useSwapForm } from "@/states/swapForm"

export const getSharedSellAmount = () => useSwapForm.getState().sellAmount

export const useResetSharedSellAmountOnUnmount = () => {
  const setSharedSellAmount = useSwapForm((state) => state.setSellAmount)

  useEffect(() => {
    return () => {
      setSharedSellAmount("")
    }
  }, [setSharedSellAmount])
}

export const useSharedSellAmountSync = <
  TFormValues extends FieldValues & { sellAmount: string },
>(
  form: UseFormReturn<TFormValues>,
) => {
  const setSharedSellAmount = useSwapForm((state) => state.setSellAmount)

  useEffect(() => {
    const subscription = form.watch((values, { name }) => {
      if (name !== undefined && name !== "sellAmount") {
        return
      }

      const nextSellAmount = values.sellAmount ?? ""

      if (nextSellAmount !== useSwapForm.getState().sellAmount) {
        setSharedSellAmount(nextSellAmount)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [form, setSharedSellAmount])
}

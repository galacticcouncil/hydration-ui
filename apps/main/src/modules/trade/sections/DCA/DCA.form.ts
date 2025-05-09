import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { periodInputSchema } from "@/components"
import { TAsset } from "@/providers/assetsProvider"
import { required, requiredAny } from "@/utils/validators"

const useSchema = () => {
  return z.object({
    sellAsset: z.custom<TAsset | null>().refine(...requiredAny),
    sellAmount: required,
    buyAsset: z.custom<TAsset | null>().refine(...requiredAny),
    buyAmount: z.string(),
    interval: periodInputSchema,
    advancedSettings: z.boolean(),
    maxRetries: z.number(),
  })
}

export type DCAFormValues = z.infer<ReturnType<typeof useSchema>>

export const useDCAForm = () => {
  const defaultValues: DCAFormValues = {
    sellAsset: null,
    sellAmount: "",
    buyAsset: null,
    buyAmount: "",
    interval: {
      value: 0,
      type: "hour",
    },
    advancedSettings: false,
    maxRetries: 0,
  }

  const form = useForm<DCAFormValues>({
    resolver: zodResolver(useSchema()),
    defaultValues,
  })

  const { watch, setValue } = form
  useEffect(() => {
    const subscription = watch(({ sellAmount, buyAmount }, { name, type }) => {
      if (type === "change" && name === "sellAmount") {
        setValue("buyAmount", sellAmount ?? "")
      } else if (type === "change" && name === "buyAmount") {
        setValue("sellAmount", buyAmount ?? "")
      }
    })

    return () => subscription.unsubscribe()
  }, [watch, setValue])

  return form
}

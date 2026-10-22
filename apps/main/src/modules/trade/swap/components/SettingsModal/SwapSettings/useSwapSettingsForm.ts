import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

import { useSaveFormOnChange } from "@/hooks/useSaveFormOnChange"
import { dcaOrderSchema, swapSettingsSchema } from "@/states/tradeSettings"

const swapSettingsFormSchema = z.object({
  swap: swapSettingsSchema,
  dca: dcaOrderSchema,
})

export type SwapSettingsFormValues = z.infer<typeof swapSettingsFormSchema>

export const useSwapSettingsForm = (
  defaultValues: SwapSettingsFormValues,
  onUpdate: (values: SwapSettingsFormValues) => void,
) => {
  const form = useForm<SwapSettingsFormValues>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(swapSettingsFormSchema),
  })

  useSaveFormOnChange(form, onUpdate)

  return form
}

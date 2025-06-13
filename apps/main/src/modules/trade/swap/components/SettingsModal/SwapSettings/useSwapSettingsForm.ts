import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { useSaveFormOnChange } from "@/hooks/useSaveFormOnChange"
import { SwapSettings, swapSettingsSchema } from "@/states/tradeSettings"

export const useSwapSettingsForm = (
  defaultValues: SwapSettings,
  onUpdate: (values: SwapSettings) => void,
) => {
  const form = useForm<SwapSettings>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(swapSettingsSchema),
  })

  useSaveFormOnChange(form, onUpdate)

  return form
}

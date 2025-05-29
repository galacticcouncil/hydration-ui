import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { useSaveFormOnChange } from "@/hooks/useSaveFormOnChange"
import { TradeSettings, tradeSettingsSchema } from "@/states/tradeSettings"

export const useTradeSettingsForm = (
  defaultValues: TradeSettings,
  onUpdate: (values: TradeSettings) => void,
) => {
  const form = useForm<TradeSettings>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(tradeSettingsSchema),
  })

  useSaveFormOnChange(form, onUpdate)

  return form
}

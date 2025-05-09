import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"

import { useSaveFormOnChange } from "@/hooks/useSaveFormOnChange"
import { dcaOrderSchema, DcaOrderSettings } from "@/states/tradeSettings"

export const useDcaSettingsForm = (
  defaultValues: DcaOrderSettings,
  onUpdate: (values: DcaOrderSettings) => void,
) => {
  const form = useForm<DcaOrderSettings>({
    defaultValues,
    mode: "onChange",
    resolver: standardSchemaResolver(dcaOrderSchema),
  })

  useSaveFormOnChange(form, onUpdate)

  return form
}

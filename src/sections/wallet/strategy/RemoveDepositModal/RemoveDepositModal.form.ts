import { zodResolver } from "@hookform/resolvers/zod"
import { TAsset, useAssets } from "providers/assets"
import { requiredAny } from "utils/validators"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { DOT_ASSET_ID } from "utils/constants"

const schema = z.object({
  assetReceived: z.custom<TAsset | null>().refine(...requiredAny),
  percentage: z.number(),
  customPercentageInput: z.string(),
  customValueInput: z.number(),
})

export type RemoveDepositFormValues = z.infer<typeof schema>

export const useRemoveDepositForm = () => {
  const { getAsset } = useAssets()
  const defaultValues: RemoveDepositFormValues = {
    assetReceived: getAsset(DOT_ASSET_ID) ?? null,
    percentage: 0,
    customPercentageInput: "",
    customValueInput: 0,
  }

  const form = useForm<RemoveDepositFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  return form
}

import { zodResolver } from "@hookform/resolvers/zod"
import { TAsset } from "providers/assets"
import { requiredAny } from "utils/validators"
import { useForm } from "react-hook-form"
import * as z from "zod"

const schema = z.object({
  assetReceived: z.custom<TAsset | null>().refine(...requiredAny),
  percentage: z.number(),
  customPercentageInput: z.string(),
})

export type RemoveDepositFormValues = z.infer<typeof schema>

export const useRemoveDepositForm = () => {
  const defaultValues: RemoveDepositFormValues = {
    assetReceived: null,
    percentage: 0,
    customPercentageInput: "",
  }

  const form = useForm<RemoveDepositFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  return form
}

import { TAsset } from "providers/assets"
import { required, requiredAny } from "utils/validators"
import * as z from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const schema = z.object({
  asset: z.custom<TAsset | null>().refine(...requiredAny),
  amount: z.string().pipe(required),
  balance: z.string(),
})

export type GigadotStrategyFormValues = z.infer<typeof schema>

export const useGigadotStrategyForm = () => {
  const defaultValues: GigadotStrategyFormValues = {
    asset: null,
    amount: "",
    balance: "0",
  }

  const form = useForm<GigadotStrategyFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  })

  return form
}

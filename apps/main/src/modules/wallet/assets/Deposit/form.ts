import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { TAsset } from "@/providers/assetsProvider"
import { required, requiredAny } from "@/utils/validators"

const schema = z.object({
  from: required,
  to: required,
  asset: z.custom<TAsset | null>().refine(...requiredAny),
  amount: required,
})

export type FormValues = z.infer<typeof schema>

export const useFormm = () => {
  const defaultValues: FormValues = {
    from: "",
    to: "",
    asset: null,
    amount: "",
  }

  return useForm<FormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })
}

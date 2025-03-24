import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { TAsset } from "@/providers/assetsProvider"
import { required, requiredAny } from "@/utils/validators"

const useSchema = () => {
  return z.object({
    address: z.string().pipe(required),
    asset: z.custom<TAsset | null>().refine(...requiredAny),
    amount: z.string().pipe(required),
  })
}

export type TransferPositionFormValues = z.infer<ReturnType<typeof useSchema>>

export const useTransferPositionForm = () => {
  const defaultValues: TransferPositionFormValues = {
    address: "",
    asset: null,
    amount: "",
  }

  return useForm<TransferPositionFormValues>({
    defaultValues,
    resolver: zodResolver(useSchema()),
  })
}

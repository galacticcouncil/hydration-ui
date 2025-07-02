import { zodResolver } from "@hookform/resolvers/zod"
import { TAsset, useAssets } from "providers/assets"
import { requiredAny } from "utils/validators"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { DOT_ASSET_ID } from "utils/constants"
import { maxBalance } from "utils/validators"

type SchemaOptions = {
  maxBalance: string
  assetReceiveId?: string
}

const createSchema = (options: SchemaOptions) => {
  return z.object({
    assetReceived: z.custom<TAsset | null>().refine(...requiredAny),
    amount: maxBalance(options.maxBalance, 0),
  })
}

export type RemoveDepositFormValues = z.infer<ReturnType<typeof createSchema>>

export const useRemoveDepositForm = (options: SchemaOptions) => {
  const { getAsset } = useAssets()
  const defaultValues: RemoveDepositFormValues = {
    assetReceived: getAsset(options.assetReceiveId ?? DOT_ASSET_ID) ?? null,
    amount: "",
  }

  const form = useForm<RemoveDepositFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(createSchema(options)),
  })

  return form
}

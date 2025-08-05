import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import z from "zod/v4"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const schema = z.object({
  amount: required.pipe(positive),
  asset: requiredObject<TAsset>(),
})

const useSchema = () => {
  const refineMaxBalance = useValidateFormMaxBalance()
  return schema.check(
    refineMaxBalance("amount", (form) => [form.asset, form.amount]),
  )
}

export type TipFormValues = z.infer<typeof schema>

type Props = {
  assetId: string
}

export const useTipForm = ({ assetId }: Props) => {
  const { getAsset } = useAssets()
  const asset = getAsset(assetId) ?? null

  const defaultValues: TipFormValues = {
    amount: "",
    asset,
  }

  return useForm<TipFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
  })
}

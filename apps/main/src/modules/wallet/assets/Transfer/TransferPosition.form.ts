import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import {
  positive,
  required,
  requiredObject,
  useValidateFormMaxBalance,
} from "@/utils/validators"

const useSchema = () => {
  const refineMaxBalance = useValidateFormMaxBalance()

  return z
    .object({
      address: required,
      asset: requiredObject<TAsset>(),
      amount: required.pipe(positive),
    })
    .check(refineMaxBalance("amount", (form) => [form.asset, form.amount]))
}

export type TransferPositionFormValues = z.infer<ReturnType<typeof useSchema>>

type Props = {
  readonly assetId?: string
}

export const useTransferPositionForm = (props?: Props) => {
  const { getAsset } = useAssets()
  const asset = props?.assetId ? (getAsset(props?.assetId) ?? null) : null

  const defaultValues: TransferPositionFormValues = {
    address: "",
    asset: asset,
    amount: "",
  }

  return useForm<TransferPositionFormValues>({
    mode: "onChange",
    defaultValues,
    resolver: standardSchemaResolver(useSchema()),
  })
}

import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import { literal, z } from "zod/v4"

import { TAsset } from "@/providers/assetsProvider"
import { positive, required, requiredObject } from "@/utils/validators"

export const stakeFormOptions = ["stake", "unstake"] as const

const schema = z.object({
  type: literal(stakeFormOptions),
  asset: requiredObject<TAsset>(),
  amount: required.pipe(positive),
})

export type StakeFormValues = z.infer<typeof schema>

export const useStakeForm = () => {
  const defaultValues: StakeFormValues = {
    type: "stake",
    asset: null,
    amount: "",
  }

  return useForm<StakeFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(schema),
  })
}

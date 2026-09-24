import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

const schema = z.object({
  acknowledged: z.boolean(),
})

export type CollateralFormValues = z.infer<typeof schema>

export const useCollateralForm = () =>
  useForm<CollateralFormValues>({
    defaultValues: { acknowledged: false },
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })

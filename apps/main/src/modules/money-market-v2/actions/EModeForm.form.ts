import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useForm } from "react-hook-form"
import * as z from "zod/v4"

const schema = z.object({
  categoryId: z.number(),
  acknowledged: z.boolean(),
})

export type EModeFormValues = z.infer<typeof schema>

export const useEModeForm = () =>
  useForm<EModeFormValues>({
    defaultValues: { categoryId: 0, acknowledged: false },
    resolver: standardSchemaResolver(schema),
    mode: "onChange",
  })

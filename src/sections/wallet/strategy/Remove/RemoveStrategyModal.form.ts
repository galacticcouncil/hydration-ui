import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

const schema = z.object({
  percentage: z.number().min(0).max(100),
  customPercentageInput: z.string(),
})

type RemoveFormValues = z.infer<typeof schema>

export const useRemoveForm = () => {
  const defaultValues: RemoveFormValues = {
    percentage: 0,
    customPercentageInput: "",
  }

  const form = useForm<RemoveFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  })

  return form
}

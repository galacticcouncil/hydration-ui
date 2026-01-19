import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  FormField,
  Input,
  Spinner,
} from "@galacticcouncil/ui/components"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  fetchSquidUrlStatus,
  useSquidFormSchema,
} from "@/components/ProviderRpcSelect/components/SquidForm.utils"
import { useSquidListStore } from "@/states/provider"

type FormValues = {
  address: string
}

export const SquidForm = () => {
  const { t } = useTranslation()
  const { addSquid } = useSquidListStore()

  const form = useForm<FormValues>({
    defaultValues: { address: "https://" },
    mode: "onChange",
    resolver: standardSchemaResolver(useSquidFormSchema()),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ address }: FormValues) => {
      const ok = await fetchSquidUrlStatus(address)

      if (!ok) {
        throw new Error(t("rpc.change.modal.errors.indexerInvalid"))
      }

      addSquid(address)
      form.reset()
    },
    onError: (error) => {
      form.setError("address", { message: error.message })
    },
  })

  const handleSubmit = (values: FormValues) => {
    mutate(values)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Controller
        name="address"
        control={form.control}
        render={({ field, fieldState }) => (
          <FormField error={fieldState.error?.message}>
            <Input
              {...field}
              customSize="large"
              placeholder="https://"
              autoComplete="off"
              readOnly={isPending}
              iconStart={Plus}
              isError={!!fieldState.error}
              iconEnd={(props) =>
                isPending ? (
                  <Spinner {...props} />
                ) : (
                  <Button
                    variant="secondary"
                    sx={{ px: 12 }}
                    {...props}
                    type="submit"
                  >
                    {t("add")}
                  </Button>
                )
              }
            />
          </FormField>
        )}
      />
    </form>
  )
}

import { getSquidSdk } from "@galacticcouncil/indexer/squid"
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
  SquidFormValues,
  useSquidFormSchema,
} from "@/components/ProviderRpcSelect/components/SquidForm.utils"
import { useSquidListStore } from "@/states/provider"

export const SquidForm = () => {
  const { t } = useTranslation()
  const { addSquid } = useSquidListStore()

  const form = useForm<SquidFormValues>({
    defaultValues: { address: "" },
    mode: "onChange",
    resolver: standardSchemaResolver(useSquidFormSchema()),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ address }: SquidFormValues) => {
      try {
        await getSquidSdk(address).LatestBlockHeightQuery()
      } catch (error) {
        throw new Error(t("rpc.change.modal.errors.indexerInvalid"))
      }

      addSquid(address)
      form.reset()
    },
    onMutate: () => {
      form.clearErrors("address")
    },
    onError: (error) => {
      form.setError("address", { message: error.message })
    },
  })

  return (
    <form onSubmit={form.handleSubmit((values) => mutate(values))}>
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

import { Plus } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  FormField,
  Input,
  Spinner,
} from "@galacticcouncil/ui/components"
import { pingRpc } from "@galacticcouncil/utils"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import {
  RpcFormValues,
  useRpcFormSchema,
} from "@/components/ProviderRpcSelect/components/RpcForm.utils"
import { useRpcListStore } from "@/states/provider"

const PING_TIMEOUT = 10000

export const RpcForm = () => {
  const { t } = useTranslation()
  const { addRpc } = useRpcListStore()

  const form = useForm<RpcFormValues>({
    defaultValues: { address: "wss://" },
    mode: "onChange",
    resolver: standardSchemaResolver(useRpcFormSchema()),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ address }: RpcFormValues) => {
      const status = await pingRpc(address, PING_TIMEOUT)

      if (status.ping === Infinity) {
        throw new Error(t("rpc.change.modal.errors.rpcInvalid"))
      }

      addRpc(address)
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
              placeholder="wss://"
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
                    type="submit"
                    {...props}
                    sx={{ px: 12 }}
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

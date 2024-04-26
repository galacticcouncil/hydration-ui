import { PROVIDERS, useProviderRpcUrlStore } from "api/provider"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { Fragment, useState } from "react"

import { SubstrateApis } from "@galacticcouncil/xcm-sdk"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useRpcStore } from "state/store"
import { FormValues } from "utils/helpers"
import { SContainer, SHeader } from "./ProviderSelectModal.styled"
import { connectWsProvider } from "./ProviderSelectModal.utils"
import { ProviderInput } from "./components/ProviderInput/ProviderInput"
import { ProviderItem } from "./components/ProviderItem/ProviderItem"

export type ProviderSelectFormProps = {
  onSave: (rpcUrl: string) => void
  onRemove: (rpcUrl: string) => void
}

export const ProviderSelectForm: React.FC<ProviderSelectFormProps> = ({
  onRemove,
  onSave,
}) => {
  const { rpcUrl } = useProviderRpcUrlStore()
  const activeRpcUrl = rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const [userRpcUrl, setUserRpcUrl] = useState(activeRpcUrl)
  const { t } = useTranslation()
  const { rpcList, addRpc } = useRpcStore()

  const form = useForm<{ address: string }>({
    defaultValues: { address: "wss://" },
    mode: "onChange",
  })

  const mutation = useMutation(async (value: FormValues<typeof form>) => {
    try {
      const provider = await connectWsProvider(value.address)

      const apiPool = SubstrateApis.getInstance()
      const api = await apiPool.api(provider.endpoint)

      const relay = await api.query.parachainSystem.validationData()
      const relayParentNumber = relay.unwrap().relayParentNumber

      if (relayParentNumber.toNumber()) {
        addRpc(value.address)
        form.reset()
      }
    } catch (e) {
      if (e === "disconnected")
        form.setError("address", {
          message: t("rpc.change.modal.errors.notExist"),
        })
      throw new Error(t("rpc.change.modal.errors.notExist"))
    }
  })
  return (
    <>
      <form onSubmit={form.handleSubmit((a) => mutation.mutate(a))}>
        <Controller
          name="address"
          control={form.control}
          rules={{
            required: t("wallet.assets.transfer.error.required"),
            validate: {
              duplicate: (value) => {
                const isDuplicate = rpcList.find(
                  (rpc) => rpc.url === `wss://${value}`,
                )
                return !isDuplicate || t("rpc.change.modal.errors.duplicate")
              },
            },
          }}
          render={({
            field: { name, value, onChange },
            fieldState: { error },
          }) => (
            <ProviderInput
              name={name}
              value={value}
              onChange={onChange}
              error={error?.message}
              button={
                <Button
                  size="small"
                  type="submit"
                  isLoading={mutation.isLoading}
                >
                  {t("add")}
                </Button>
              }
            />
          )}
        />
      </form>

      <SContainer>
        <SHeader>
          <div css={{ gridArea: "name" }}>
            {t("rpc.change.modal.column.name")}
          </div>
          <div css={{ gridArea: "status" }}>
            {t("rpc.change.modal.column.status")}
          </div>
          <div css={{ gridArea: "url" }} sx={{ textAlign: "right" }}>
            {t("rpc.change.modal.column.rpc")}
          </div>
        </SHeader>

        {PROVIDERS.filter((provider) =>
          typeof provider.env === "string"
            ? provider.env === import.meta.env.VITE_ENV
            : provider.env.includes(import.meta.env.VITE_ENV),
        ).map((provider, index) => {
          return (
            <Fragment key={provider.url}>
              <ProviderItem
                name={provider.name}
                url={provider.url}
                isActive={provider.url === userRpcUrl}
                onClick={() => setUserRpcUrl(provider.url)}
              />
              {index + 1 < PROVIDERS.length && (
                <Separator color="alpha0" opacity={0.06} />
              )}
            </Fragment>
          )
        })}

        {rpcList?.map((rpc, index) => (
          <Fragment key={rpc.url}>
            <ProviderItem
              name={
                rpc.name ??
                t("rpc.change.modal.name.label", { index: index + 1 })
              }
              url={rpc.url}
              isActive={rpc.url === userRpcUrl}
              onClick={() => setUserRpcUrl(rpc.url)}
              custom
              onRemove={onRemove}
            />
            {index + 1 < PROVIDERS.length && (
              <Separator color="alpha0" opacity={0.06} />
            )}
          </Fragment>
        ))}
      </SContainer>

      <Button
        variant="primary"
        fullWidth
        sx={{ mt: 50 }}
        onClick={() => onSave(userRpcUrl)}
      >
        {t("rpc.change.modal.save")}
      </Button>
    </>
  )
}

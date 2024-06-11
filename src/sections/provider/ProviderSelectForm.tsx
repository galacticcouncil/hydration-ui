import {
  PROVIDER_LIST,
  PROVIDER_URLS,
  useProviderData,
  useProviderRpcUrlStore,
} from "api/provider"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { Fragment, useEffect, useState } from "react"

import { SubstrateApis } from "@galacticcouncil/xcm-core"
import { useMutation } from "@tanstack/react-query"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useRpcStore } from "state/store"
import { FormValues } from "utils/helpers"
import { SContainer, SHeader } from "./ProviderSelectModal.styled"
import { ProviderInput } from "./components/ProviderInput/ProviderInput"
import { ProviderItem } from "./components/ProviderItem/ProviderItem"
import { useProviderSelectFormSchema } from "./ProviderSelectForm.utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTimeoutFn } from "react-use"

export type ProviderSelectFormProps = {
  onSave: (rpcUrl: string) => void
  onRemove: (rpcUrl: string) => void
  onClose: () => void
}

export const ProviderSelectForm: React.FC<ProviderSelectFormProps> = ({
  onRemove,
  onSave,
  onClose,
}) => {
  const { isLoading } = useProviderData()
  const { rpcUrl } = useProviderRpcUrlStore()
  const { t } = useTranslation()
  const { rpcList, addRpc } = useRpcStore()
  const [timeoutedRpc, setTimeoutedRpc] = useState("")

  const fullRpcUrlList = [...PROVIDER_URLS, ...rpcList.map(({ url }) => url)]

  const form = useForm<{ address: string }>({
    defaultValues: { address: "wss://" },
    mode: "onChange",
    resolver: zodResolver(useProviderSelectFormSchema(fullRpcUrlList)),
  })

  useTimeoutFn(async () => {
    if (isLoading) {
      setTimeoutedRpc(rpcUrl)
    }
  }, 5000)

  useEffect(() => {
    return useProviderRpcUrlStore.subscribe(async (state, prevState) => {
      if (state.rpcUrl !== prevState.rpcUrl) {
        setTimeoutedRpc("")
      }
    })
  }, [])

  const mutation = useMutation(async (value: FormValues<typeof form>) => {
    setTimeoutedRpc("")
    return await new Promise(async (resolve, reject) => {
      const errMessage = t("rpc.change.modal.errors.notExist")
      const timeout = setTimeout(() => {
        clearTimeout(timeout)
        form.setError("address", {
          message: errMessage,
        })
        reject(new Error(errMessage))
      }, 10000)

      try {
        const apiPool = SubstrateApis.getInstance()
        const api = await apiPool.api(value.address, 3)

        const relay = await api.query.parachainSystem.validationData()
        const relayParentNumber = relay.unwrap().relayParentNumber

        if (relayParentNumber.toNumber()) {
          addRpc(value.address)
          form.reset()
        }
        resolve(true)
      } catch (e) {
        form.setError("address", {
          message: errMessage,
        })
        reject(new Error(errMessage))
      } finally {
        clearTimeout(timeout)
      }
    })
  })

  return (
    <>
      <form onSubmit={form.handleSubmit((a) => mutation.mutate(a))}>
        <Controller
          name="address"
          control={form.control}
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
                  disabled={mutation.isLoading}
                >
                  {t("add")}
                </Button>
              }
            />
          )}
        />
      </form>

      <SContainer isLoading={isLoading && !timeoutedRpc}>
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

        {PROVIDER_LIST.map((provider, index) => {
          return (
            <Fragment key={provider.url}>
              <ProviderItem
                name={provider.name}
                url={provider.url}
                isActive={provider.url === rpcUrl}
                isError={provider.url === timeoutedRpc}
                onClick={() => onSave(provider.url)}
              />
              {index + 1 < PROVIDER_LIST.length && (
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
              isActive={rpc.url === rpcUrl}
              isError={rpc.url === timeoutedRpc}
              onClick={() => onSave(rpc.url)}
              custom
              onRemove={onRemove}
            />
            {index + 1 < rpcList.length && (
              <Separator color="alpha0" opacity={0.06} />
            )}
          </Fragment>
        ))}
      </SContainer>

      <Button variant="primary" fullWidth sx={{ mt: 50 }} onClick={onClose}>
        {t("rpc.change.modal.close")}
      </Button>
    </>
  )
}

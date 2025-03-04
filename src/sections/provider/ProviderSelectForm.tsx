import {
  PROVIDER_LIST,
  PROVIDER_URLS,
  useProviderRpcUrlStore,
} from "api/provider"
import { Button } from "components/Button/Button"
import { Separator } from "components/Separator/Separator"
import { useEffect, useMemo, useState } from "react"

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
import { useRpcProvider } from "providers/rpcProvider"
import { prop, uniqBy } from "utils/rx"
import { SProviderItemScrollableContainer } from "sections/provider/components/ProviderItem/ProviderItem.styled"
import { useRpcsInfo, useRpcsPing } from "api/rpc"

export type ProviderSelectFormProps = {
  onClose: () => void
}

export const ProviderSelectForm: React.FC<ProviderSelectFormProps> = ({
  onClose,
}) => {
  const { isLoaded } = useRpcProvider()
  const { rpcUrl, setRpcUrl } = useProviderRpcUrlStore()
  const { t } = useTranslation()
  const { rpcList, addRpc, removeRpc } = useRpcStore()
  const [isRpcUrlChanging, setIsRpcUrlChanging] = useState(false)

  const fullRpcUrlList = [...PROVIDER_URLS, ...rpcList.map(({ url }) => url)]

  const form = useForm<{ address: string }>({
    defaultValues: { address: "wss://" },
    mode: "onChange",
    resolver: zodResolver(useProviderSelectFormSchema(fullRpcUrlList)),
  })

  useEffect(() => {
    setIsRpcUrlChanging(true)
    const id = setTimeout(() => {
      setIsRpcUrlChanging(false)
    }, 5000)
    return () => clearTimeout(id)
  }, [rpcUrl])

  const mutation = useMutation(async (value: FormValues<typeof form>) => {
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

  const providerList = useMemo(() => {
    const list = [
      ...PROVIDER_LIST.map(({ name, url }) => ({
        name,
        url,
        custom: false,
      })),
      ...rpcList.map((rpc, index) => ({
        ...rpc,
        name:
          rpc.name ?? t("rpc.change.modal.name.label", { index: index + 1 }),
        custom: true,
      })),
    ]

    return uniqBy(prop("url"), list)
  }, [rpcList, t])

  const rpcsInfo = useRpcsInfo(providerList.map(prop("url")))
  const rpcsPing = useRpcsPing(providerList.map(prop("url")))

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

      <SContainer isLoading={!isLoaded && isRpcUrlChanging}>
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

        <SProviderItemScrollableContainer>
          {providerList.map((provider, index) => {
            return (
              <div sx={{ width: "auto" }} key={provider.url}>
                <ProviderItem
                  {...provider}
                  {...rpcsInfo[index]?.data}
                  ping={rpcsPing[index]?.data}
                  isActive={provider.url === rpcUrl}
                  onClick={setRpcUrl}
                  onRemove={removeRpc}
                />
                {index + 1 < PROVIDER_LIST.length && (
                  <Separator color="alpha0" opacity={0.06} />
                )}
              </div>
            )
          })}
        </SProviderItemScrollableContainer>
      </SContainer>

      <Separator
        color="alpha0"
        opacity={0.06}
        sx={{
          mb: "var(--modal-content-padding)",
          width: "auto",
          mx: "calc(var(--modal-content-padding) * -1)",
        }}
      />

      <Button variant="primary" fullWidth onClick={onClose}>
        {t("rpc.change.modal.close")}
      </Button>
    </>
  )
}

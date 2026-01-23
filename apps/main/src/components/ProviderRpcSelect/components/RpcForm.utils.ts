import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { PROVIDER_URLS } from "@/api/provider"
import { useRpcListStore } from "@/states/provider"
import { required, validWebsocketUrl } from "@/utils/validators"

export type RpcFormValues = z.infer<ReturnType<typeof useRpcFormSchema>>

export const useRpcFormSchema = () => {
  const { t } = useTranslation()

  const { rpcList } = useRpcListStore()

  const existingUrls = [...PROVIDER_URLS, ...rpcList.map(({ url }) => url)]

  return z.object({
    address: required
      .pipe(validWebsocketUrl)
      .refine(
        (value) => !existingUrls.some((url) => url === value),
        t("rpc.change.modal.errors.rpcDuplicate"),
      ),
  })
}

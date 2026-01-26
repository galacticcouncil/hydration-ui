import { stripTrailingSlash } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { useFullSquidUrlList } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { required, validHttpUrl } from "@/utils/validators"

export type SquidFormValues = z.infer<ReturnType<typeof useSquidFormSchema>>

export const useSquidFormSchema = () => {
  const { t } = useTranslation()

  const squidUrlList = useFullSquidUrlList()
  const existingUrls = new Set([
    ...squidUrlList.map(({ url }) => stripTrailingSlash(url)),
  ])

  return z.object({
    address: required
      .pipe(validHttpUrl)
      .refine(
        (value) => !existingUrls.has(stripTrailingSlash(value.trim())),
        t("rpc.change.modal.errors.indexerDuplicate"),
      ),
  })
}

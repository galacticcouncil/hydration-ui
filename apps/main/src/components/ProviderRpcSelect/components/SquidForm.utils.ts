import { stripTrailingSlash } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { useFullSquidUrlList } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { required, validHttpUrl } from "@/utils/validators"

export const fetchSquidUrlStatus = async (url: string): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: "{ __typename }",
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

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
        (value) => !existingUrls.has(stripTrailingSlash(value)),
        t("rpc.change.modal.errors.indexerDuplicate"),
      ),
  })
}

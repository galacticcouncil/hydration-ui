import { useTranslation } from "react-i18next"
import { required } from "utils/validators"
import { z } from "zod"

export const WSS_REGEX =
  /^wss?:\/\/[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+(:[0-9]+)?(\/.*)?$/i

export const useProviderSelectFormSchema = (rpcList: string[]) => {
  const { t } = useTranslation()

  return z.object({
    address: required.pipe(
      z
        .string()
        .refine(
          (value) => !rpcList.some((url) => url === value),
          t("rpc.change.modal.errors.duplicate"),
        )
        .refine(
          (value) => WSS_REGEX.test(value),
          t("rpc.change.modal.errors.invalid"),
        ),
    ),
  })
}

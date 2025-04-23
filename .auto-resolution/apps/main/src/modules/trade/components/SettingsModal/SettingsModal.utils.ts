import { useTranslation } from "react-i18next"
import { z } from "zod"

import { required } from "@/utils/validators"

const MAX = 100
const MIN = 0.5

export const useSettingsValidation = () => {
  const { t } = useTranslation()
  return z.object({
    swap: required
      .refine((value) => Number(value) <= MAX, {
        message: t("error.maxNumber", {
          value: MAX,
        }),
      })
      .refine((value) => Number(value) >= MIN, {
        message: t("error.minNumber", {
          value: MIN,
        }),
      }),
    twap: required
      .refine((value) => Number(value) <= MAX, {
        message: t("error.maxNumber", {
          value: MAX,
        }),
      })
      .refine((value) => Number(value) >= MIN, {
        message: t("error.minNumber", {
          value: MIN,
        }),
      }),
  })
}

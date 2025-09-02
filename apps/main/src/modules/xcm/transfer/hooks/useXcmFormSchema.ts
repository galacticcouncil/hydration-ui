import { Account } from "@galacticcouncil/web3-connect"
import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { useMemo } from "react"
import { FieldPathByValue } from "react-hook-form"
import { isObjectType } from "remeda"
import { z } from "zod/v4"

import i18n from "@/i18n"
import { positive, required } from "@/utils/validators"

const createSchema = () => {
  return z.object({
    srcChain: z.custom<AnyChain | null>(
      (val) => isObjectType(val),
      i18n.t("error.required"),
    ),
    srcAsset: z.custom<Asset | null>(
      (val) => isObjectType(val),
      i18n.t("error.required"),
    ),
    destChain: z.custom<AnyChain | null>(
      (val) => isObjectType(val),
      i18n.t("error.required"),
    ),
    destAsset: z.custom<Asset | null>(
      (val) => isObjectType(val),
      i18n.t("error.required"),
    ),
    srcAmount: required.pipe(positive),
    destAmount: required,
    destAddress: required,
    destAccount: z.custom<Account>((val) => isObjectType(val)).nullable(),
  })
}

export type XcmFormValues = z.infer<ReturnType<typeof createSchema>>
export type XcmFormFieldName = FieldPathByValue<XcmFormValues, string>

export const useXcmFormSchema = () => {
  return useMemo(() => createSchema(), [])
}

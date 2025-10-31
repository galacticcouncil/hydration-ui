import { Account } from "@galacticcouncil/web3-connect"
import { AnyChain, Asset } from "@galacticcouncil/xcm-core"
import { Transfer } from "@galacticcouncil/xcm-sdk"
import Big from "big.js"
import { useMemo } from "react"
import { FieldPathByValue } from "react-hook-form"
import { isObjectType } from "remeda"
import { z } from "zod/v4"

import i18n from "@/i18n"
import { positive, required } from "@/utils/validators"

const createSchema = (transfer: Transfer | null) => {
  const srcAmountSchema = transfer
    ? required
        .pipe(positive)
        .refine(
          (value) => new Big(value).gte(transfer.source.min.toDecimal()),
          i18n.t("error.minNumber", {
            value: transfer.source.min.toDecimal(),
          }),
        )
        .refine(
          (value) => new Big(value).lte(transfer.source.max.toDecimal()),
          i18n.t("error.maxNumber", {
            value: transfer.source.max.toDecimal(),
          }),
        )
    : z.string()

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
    srcAmount: srcAmountSchema,
    destAmount: required,
    destAddress: required,
    destAccount: z.custom<Account>((val) => isObjectType(val)).nullable(),
  })
}

export type XcmFormValues = z.infer<ReturnType<typeof createSchema>>
export type XcmFormFieldName = FieldPathByValue<XcmFormValues, string>

export const useXcmFormSchema = (transfer: Transfer | null) => {
  return useMemo(() => createSchema(transfer), [transfer])
}

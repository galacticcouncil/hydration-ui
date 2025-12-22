import { Account } from "@galacticcouncil/web3-connect"
import { AnyChain, Asset } from "@galacticcouncil/xc-core"
import { Transfer } from "@galacticcouncil/xc-sdk"
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
          i18n.t("xcm:error.minAmount", {
            amount: transfer.source.min.toDecimal(),
            symbol: transfer.source.min.originSymbol,
          }),
        )
        .refine(
          (value) => new Big(value).lte(transfer.source.max.toDecimal()),
          i18n.t("xcm:error.maxAmount", {
            amount: transfer.source.max.toDecimal(),
            symbol: transfer.source.max.originSymbol,
          }),
        )
    : required

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
    destAmount: z.string(),
    destAddress: required,
    destAccount: z.custom<Account>((val) => isObjectType(val)).nullable(),
  })
}

export type XcmFormValues = z.infer<ReturnType<typeof createSchema>>
export type XcmFormFieldName = FieldPathByValue<XcmFormValues, string>

export const useXcmFormSchema = (transfer: Transfer | null) => {
  return useMemo(() => createSchema(transfer), [transfer])
}

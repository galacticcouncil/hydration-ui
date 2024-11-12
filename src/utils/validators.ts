import BigNumber from "bignumber.js"
import i18n from "i18next"
import { safeConvertAddressH160 } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { z } from "zod"

export const required = z.string().trim().min(1, i18n.t("error.required"))

export const validNumber = z
  .string()
  .refine((value) => !BigNumber(value).isNaN(), i18n.t("error.validNumber"))

export const positive = z
  .string()
  .pipe(validNumber)
  .refine((value) => BigNumber(value).gt(0), i18n.t("error.positive"))

export const maxBalance = (balance: string, decimals: number) => {
  return z
    .string()
    .pipe(positive)
    .refine(
      (value) =>
        Number.isFinite(decimals) &&
        BigNumber(value).lte(BigNumber(balance).shiftedBy(-decimals)),
      i18n.t("error.maxBalance"),
    )
}

export const noWhitespace = z
  .string()
  .refine((s) => !/\s/gi.test(s), i18n.t("error.whitespace"))

export const validH160Address = required.refine(
  (value) => !!safeConvertAddressH160(value),
  i18n.t("error.validAddress"),
)

export const validSS58Address = required.refine(
  (value) => !!safeConvertAddressSS58(value, 0),
  i18n.t("error.validAddress"),
)

export const validAddress = validSS58Address.or(validH160Address)

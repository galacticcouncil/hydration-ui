import BigNumber from "bignumber.js"
import i18n from "i18next"
import { z } from "zod"

export const required = z.string().trim().min(1, i18n.t("error.required"))

export const finite = z
  .string()
  .refine((value) => !BigNumber(value).isNaN(), i18n.t("error.validNumber"))

export const positive = z
  .string()
  .pipe(finite)
  .refine((value) => BigNumber(value).gt(0), i18n.t("error.positive"))

export const greaterThan = (val: number) =>
  z
    .string()
    .pipe(finite)
    .refine(
      (value) => BigNumber(value).gt(val),
      i18n.t("error.greaterThan", { value: val }),
    )

export const lessThan = (val: number) =>
  z
    .string()
    .pipe(finite)
    .refine(
      (value) => BigNumber(value).lt(val),
      i18n.t("error.lessThan", { value: val }),
    )

export const maxBalance = (balance: BigNumber, decimals: number) => {
  return z
    .string()
    .pipe(positive)
    .refine(
      (value) =>
        Number.isFinite(decimals) &&
        BigNumber(value).lte(balance.shiftedBy(-decimals)),
      i18n.t("error.maxBalance"),
    )
}

import BigNumber from "bignumber.js"
import i18n from "i18next"
import { TAsset } from "providers/assets"
import { safeConvertAddressH160 } from "utils/evm"
import { safeConvertAddressSS58 } from "utils/formatting"
import { z } from "zod"

export const required = z.string().trim().min(1, i18n.t("error.required"))

export const requiredAny = [
  (value: unknown) => !!value,
  i18n.t("error.required"),
] as const

export const validNumber = z
  .string()
  .refine((value) => !BigNumber(value).isNaN(), i18n.t("error.validNumber"))

export const positive = z
  .string()
  .pipe(validNumber)
  .refine((value) => BigNumber(value).gt(0), i18n.t("error.positive"))

export const maxBalanceError = i18n.t("error.maxBalance")

export const maxBalance = (balance: string, decimals: number) => {
  return z
    .string()
    .pipe(positive)
    .refine(
      (value) => validateMaxBalance(balance, value, decimals),
      maxBalanceError,
    )
}

export const validateMaxBalance = (
  balance: string,
  value: string,
  decimals: number,
): boolean =>
  Number.isFinite(decimals) &&
  BigNumber(value).lte(BigNumber(balance).shiftedBy(-decimals))
export const otcExistentialDeposit = (
  asset: TAsset | undefined,
  multiplier: number | undefined,
) => {
  return z
    .string()
    .pipe(positive)
    .refine(
      (value) =>
        asset &&
        multiplier !== undefined &&
        Number.isFinite(asset.decimals) &&
        BigNumber(value).gte(
          BigNumber(asset.existentialDeposit)
            .shiftedBy(-asset.decimals)
            .multipliedBy(multiplier),
        ),
      i18n.t("otc.order.fill.validation.orderTooLow"),
    )
}

export const validateOtcExistentialDeposit = (
  asset: TAsset | undefined,
  multiplier: number | undefined,
  amount: string,
): string | undefined =>
  !asset ||
  !Number.isFinite(asset.decimals) ||
  multiplier === undefined ||
  BigNumber(amount).gte(
    BigNumber(asset.existentialDeposit)
      .shiftedBy(-asset.decimals)
      .multipliedBy(multiplier),
  )
    ? undefined
    : i18n.t("otc.order.fill.validation.orderTooLow")

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

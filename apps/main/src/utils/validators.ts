import Big from "big.js"
import * as z from "zod"

import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const required = z.string().trim().min(1, i18n.t("error.required"))

export const requiredAny = [
  (value: unknown) => value !== null || value !== undefined,
  i18n.t("error.required"),
] as const

export const WSS_REGEX =
  /^wss?:\/\/(localhost|[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+)(:[0-9]+)?(\/.*)?$/i

export const validWebsocketUrl = z
  .string()
  .refine((value) => WSS_REGEX.test(value), i18n.t("error.invalidWebsocketUrl"))

export const validNumber = z.string().refine((value) => {
  try {
    new Big(value)
    return true
  } catch {
    return false
  }
}, i18n.t("error.validNumber"))

export const positive = z
  .string()
  .pipe(validNumber)
  .refine((value) => new Big(value).gt(0), i18n.t("error.positive"))

export const maxBalance = (balance: bigint | string | number) =>
  z
    .string()
    .pipe(positive)
    .refine(
      (value) =>
        new Big(value).lte(
          typeof balance === "bigint" ? balance.toString() : balance,
        ),
      i18n.t("error.maxBalance"),
    )

export const existentialDeposit = (
  asset: TAsset | undefined | null,
  multiplier: number | undefined,
) =>
  z
    .string()
    .pipe(positive)
    .refine(
      (value) =>
        !multiplier ||
        !asset ||
        new Big(scaleHuman(asset.existentialDeposit, asset.decimals))
          .mul(multiplier)
          .lte(value),
      i18n.t("error.existentialDeposit"),
    )

export const validateExistentialDeposit = (
  asset: TAsset | undefined | null,
  amount: string,
  multiplier: number | undefined,
): string | undefined => {
  const result = existentialDeposit(asset, multiplier).safeParse(amount)

  if (!result.success) {
    return JSON.parse(result.error.message)[0]?.message
  }
}

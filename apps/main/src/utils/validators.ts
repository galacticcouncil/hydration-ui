import Big from "big.js"
import { z } from "zod"

import i18n from "@/i18n"
import { TAsset } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const required = z.string().trim().min(1, i18n.t("error.required"))

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

export const validateExistentialDeposit = (
  asset: TAsset | undefined,
  amount: string,
  multiplier: number | undefined,
): string | undefined =>
  !!multiplier &&
  (!asset ||
    new Big(scaleHuman(asset.existentialDeposit, asset.decimals))
      .mul(multiplier)
      .lte(amount))
    ? undefined
    : i18n.t("error.existentialDeposit")
